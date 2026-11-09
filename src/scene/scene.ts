import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createCameraGuard } from './camera'
import { LANDMARKS, LAND_Y, TRAY, type LandmarkSite } from './geo'
import { planCity } from './plan'
import { buildBuilding, FAMILIES, FAMILY_CHOICES, heightFor, type Family } from './buildings'
import { Kit } from './kit'
import { buildLandmark, LANDMARK_ENVELOPES } from './landmarks'
import { buildEnvironment } from './environment'
import { addCityLife } from './traffic'
import { QUALITY, type QualityTier } from '../config'

export interface CityState {
  azimuth: number
  polar: number
  distance: number
  target: [number, number, number]
  night: number
  targetNight: 0 | 1
  rotating: boolean
  transition: boolean
  cameraClear: boolean
  time: number
}
export interface CityFacts {
  roadEdges: number
  vehicles: number
  pedestrians: number
  boats: number
  buildings: number
  triangles: number
  drawCalls: number
}
export type CityAPI = {
  tick: (dt: number) => void
  state: () => CityState
  facts: CityFacts
  setNight: (value: boolean) => void
  setRotate: (value: boolean) => void
  reset: () => void
  home: () => void
  focus: (i: number) => void
  zoom: (factor: number) => void
  orbitBy: (dTheta: number, dPhi: number) => void
  panBy: (dx: number, dz: number) => void
  screenshot: () => string
  dispose: () => void
}
export interface CityOptions {
  quality: QualityTier
  reducedMotion: boolean
  live: boolean
  view: string | null
  viewOffset: () => boolean
  onFrame: () => void
}

export const landmarkAnchors = LANDMARKS
export const landmarkViews = LANDMARKS.map((l) => ({ look: l.look, offset: l.offset }))

interface Lot {
  x: number
  z: number
  w: number
  d: number
  rot: number
  height: number
  family: Family
  variant: number
  district: string
}

const HOME = new THREE.Vector3(12.2, 16.2, 20.8)
const HOME_TARGET = new THREE.Vector3(0.2, 0.6, -0.2)

const DEBUG_VIEWS: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
  bridge: { position: [2.5, 6.5, -0.5], target: [-5, 1.6, -2.5] },
  opera: { position: [3.5, 3.8, 1.6], target: [-0.85, 0.95, -1.75] },
  harbour: { position: [3.5, 5.5, -4.5], target: [2.7, 0.85, -3.35] },
  north: { position: [3.5, 6.5, -1.0], target: [-4.5, 1.2, -5.2] },
}

export function createCity(container: HTMLDivElement, options: CityOptions): CityAPI {
  const tier = QUALITY[options.quality]
  const scene = new THREE.Scene()
  const dayBg = new THREE.Color('#dceaf0')
  const nightBg = new THREE.Color('#081526')
  scene.background = dayBg.clone()
  scene.fog = new THREE.Fog(dayBg, 48, 120)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, tier.pixelRatio))
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.autoUpdate = false
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.16
  renderer.outputColorSpace = THREE.SRGBColorSpace
  container.appendChild(renderer.domElement)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04)
  scene.environment = environment.texture
  scene.environmentIntensity = 0.55
  pmrem.dispose()

  const camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.05, 220)
  const requested = options.view ? DEBUG_VIEWS[options.view] : undefined
  camera.position.copy(requested ? new THREE.Vector3().fromArray(requested.position) : HOME)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.copy(requested ? new THREE.Vector3().fromArray(requested.target) : HOME_TARGET)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.minDistance = 3
  controls.maxDistance = 70
  controls.maxPolarAngle = Math.PI * 0.46
  controls.minPolarAngle = 0.02
  controls.autoRotateSpeed = 0.42
  controls.zoomSpeed = 0.72
  controls.panSpeed = 0.66
  controls.screenSpacePanning = false
  controls.listenToKeyEvents(window)
  controls.keyPanSpeed = 18

  const hemi = new THREE.HemisphereLight('#d9efff', '#a8a88a', 1.35)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight('#fff2d2', 2.25)
  sun.position.set(-13, 25, 11)
  sun.castShadow = true
  sun.shadow.mapSize.set(tier.shadowMap, tier.shadowMap)
  Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 22, bottom: -22, near: 1, far: 80 })
  sun.shadow.normalBias = 0.035
  sun.shadow.bias = -0.0002
  sun.shadow.radius = 3
  scene.add(sun)
  const cityGlow = new THREE.AmbientLight('#ffbd7a', 0)
  scene.add(cityGlow)
  const fill = new THREE.DirectionalLight('#7aafff', 0.5)
  fill.position.set(16, 9, -14)
  scene.add(fill)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(240, 240),
    new THREE.MeshStandardMaterial({ color: '#dbe4e2', roughness: 1 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.4
  ground.receiveShadow = true
  scene.add(ground)

  let seed = 9137
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }

  const plan = planCity()
  const kit = new Kit(scene)
  const lots: Lot[] = []
  const familySequence: Partial<Record<Family, number>> = {}
  const chosen: Family[] = plan.parcels.map((parcel) => {
    const choices = FAMILY_CHOICES[parcel.district] ?? FAMILY_CHOICES['CBD core']
    return choices[Math.floor(rand() * choices.length)]
  })
  // Guarantee every authored family appears, without moving any parcel.
  FAMILIES.forEach((family) => {
    if (chosen.includes(family)) return
    const index = plan.parcels.findIndex((parcel) =>
      (FAMILY_CHOICES[parcel.district] ?? []).includes(family),
    )
    if (index >= 0) chosen[index] = family
  })
  plan.parcels.forEach((parcel, i) => {
    const family = chosen[i]
    const height = heightFor(family, parcel.district, rand())
    const variant = familySequence[family] ?? 0
    familySequence[family] = variant + 1
    kit.at(parcel.x, parcel.z, LAND_Y, parcel.rot)
    buildBuilding(kit, family, parcel.w, parcel.d, height, variant)
    lots.push({ ...parcel, height, family, variant })
  })

  const landmarkGroups: THREE.Group[] = []
  const landmarkLots: { x: number; z: number; w: number; d: number; height: number }[] = []
  LANDMARKS.forEach((site) => {
    const group = buildLandmark(site)
    scene.add(group)
    landmarkGroups.push(group)
    const env = LANDMARK_ENVELOPES[site.id]
    landmarkLots.push({ x: site.x, z: site.z, w: env.w, d: env.d, height: env.maxY })
  })
  kit.finish()

  const rotated = (x: number, z: number, w: number, d: number, rot: number, height: number) => {
    const c = Math.abs(Math.cos(rot))
    const s = Math.abs(Math.sin(rot))
    return { x, z, w: w * c + d * s, d: w * s + d * c, height }
  }
  const footprints = [
    ...lots.map((lot) => rotated(lot.x, lot.z, lot.w, lot.d, lot.rot, LAND_Y + lot.height)),
    ...landmarkLots,
  ]
  const urban = buildEnvironment(scene, plan)
  const life = addCityLife(scene, plan, urban.walks)

  const blockers = footprints.map(
    (b) =>
      new THREE.Box3(
        new THREE.Vector3(b.x - b.w / 2 - 0.04, LAND_Y, b.z - b.d / 2 - 0.04),
        new THREE.Vector3(b.x + b.w / 2 + 0.04, b.height + 0.1, b.z + b.d / 2 + 0.04),
      ),
  )
  const landmarkLights = [
    [-0.85, 1.2, -1.75],
    [-5.0, 1.6, -2.45],
    [0.55, 1.8, 2.5],
    [-1.2, 1.0, 3.6],
    [-6.4, 1.1, -4.9],
    [2.7, 0.9, -3.35],
  ].map(([x, y, z]) => {
    const light = new THREE.PointLight('#ffd49a', 0, 5.5, 2)
    light.position.set(x, y, z)
    scene.add(light)
    return light
  })

  const cameraPrevious = camera.position.clone()
  const guardCamera = createCameraGuard(blockers)

  const facts: CityFacts = {
    roadEdges: plan.edges.length,
    vehicles: life.vehicles.length,
    pedestrians: life.people.length,
    boats: life.boats.length,
    buildings: lots.length + LANDMARKS.length,
    triangles: 0,
    drawCalls: 0,
  }
  container.dataset.landmarks = String(LANDMARKS.length)
  container.dataset.buildings = String(facts.buildings)
  container.dataset.roadEdges = String(facts.roadEdges)
  container.dataset.vehicles = String(facts.vehicles)
  container.dataset.boats = String(facts.boats)
  container.dataset.families = JSON.stringify([...new Set(lots.map((l) => l.family))])
  container.dataset.plan = JSON.stringify({
    nodes: plan.nodes.length,
    edges: plan.edges.length,
    parcels: plan.parcels.length,
    bridges: plan.bridges.length,
    components: plan.components,
  })

  const TRANSITION_SECONDS = options.reducedMotion ? 0 : 1.4
  let night = 0
  let targetNight = 0
  let simTime = 0
  let frames = 0
  let disposed = false
  let cameraClear = true
  let transition: {
    from: THREE.Vector3
    to: THREE.Vector3
    targetFrom: THREE.Vector3
    targetTo: THREE.Vector3
    elapsed: number
    arc: boolean
    duration: number
  } | null = null

  controls.addEventListener('start', () => {
    transition = null
  })

  const bg = dayBg.clone()
  let lastShadow = -1
  const smooth = (v: number) => {
    const u = THREE.MathUtils.clamp(v, 0, 1)
    return u * u * (3 - 2 * u)
  }
  function applyTransition(dt: number) {
    if (!transition) return
    transition.elapsed += dt
    const t = transition.duration > 0 ? Math.min(transition.elapsed / transition.duration, 1) : 1
    const ease = t * t * (3 - 2 * t)
    if (transition.arc && t < 1) {
      const clearance = Math.max(transition.from.y, transition.to.y, ...blockers.map((box) => box.max.y + 1.8))
      camera.position.lerpVectors(transition.from, transition.to, ease)
      camera.position.y =
        t < 0.28
          ? THREE.MathUtils.lerp(transition.from.y, clearance, smooth(t / 0.28))
          : t > 0.72
            ? THREE.MathUtils.lerp(clearance, transition.to.y, smooth((t - 0.72) / 0.28))
            : clearance
    } else {
      camera.position.lerpVectors(transition.from, transition.to, ease)
    }
    controls.target.lerpVectors(transition.targetFrom, transition.targetTo, ease)
    if (t === 1) transition = null
  }

  function tick(dt: number) {
    if (disposed) return
    simTime += dt
    night = options.reducedMotion ? targetNight : THREE.MathUtils.damp(night, targetNight, 1.8, dt)
    if (Math.abs(night - targetNight) < 1e-4) night = targetNight
    bg.copy(dayBg).lerp(nightBg, night)
    scene.background = bg
    ;(scene.fog as THREE.Fog).color.copy(bg)
    hemi.intensity = 1.35 - 0.28 * night
    sun.intensity = 2.25 - 1.6 * night
    sun.color.set('#fff2d2').lerp(new THREE.Color('#8fa8d8'), night)
    fill.intensity = 0.5 + 1.15 * night
    cityGlow.intensity = 0.32 * night
    renderer.toneMappingExposure = 1.12 + 0.3 * night
    scene.environmentIntensity = 0.55 - 0.12 * night
    ;(ground.material as THREE.MeshStandardMaterial).color.set('#dbe4e2').lerp(new THREE.Color('#17232c'), night)
    kit.update(night)
    landmarkLights.forEach((light, i) => (light.intensity = night * (1.5 + 0.2 * Math.sin(simTime + i))))
    urban.update(simTime, night)
    life.update(dt, simTime, night)
    applyTransition(dt)
    controls.target.y = Math.max(0.55, controls.target.y)
    controls.target.x = THREE.MathUtils.clamp(controls.target.x, -TRAY.w / 2 + 1, TRAY.w / 2 - 1)
    controls.target.z = THREE.MathUtils.clamp(controls.target.z, -TRAY.d / 2 + 1, TRAY.d / 2 - 1)
    controls.update(dt)
    if (guardCamera(cameraPrevious, camera.position)) transition = null
    cameraPrevious.copy(camera.position)
    cameraClear = !blockers.some((box) => box.containsPoint(camera.position))
    if (lastShadow < 0 || simTime - lastShadow >= 1 / 12) {
      renderer.shadowMap.needsUpdate = true
      lastShadow = simTime
    }
    renderer.render(scene, camera)
    if (frames++ === 0) {
      facts.triangles = renderer.info.render.triangles
      facts.drawCalls = renderer.info.render.calls
      options.onFrame()
    }
  }

  function resize() {
    const w = container.clientWidth
    const h = container.clientHeight
    if (!w || !h) return
    camera.aspect = w / h
    if (options.viewOffset() && w > 850) camera.setViewOffset(w, h, -Math.min(150, w * 0.105), 0, w, h)
    else camera.clearViewOffset()
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  const observer = new ResizeObserver(resize)
  observer.observe(container)
  resize()

  let raf = 0
  let last = -1
  function loop(now: number) {
    if (disposed) return
    raf = requestAnimationFrame(loop)
    const dt = last < 0 ? 1 / 60 : Math.min((now - last) / 1000, 0.05)
    last = now
    tick(dt)
  }
  if (options.live) raf = requestAnimationFrame(loop)

  function settleControls() {
    const damping = controls.enableDamping
    const rotate = controls.autoRotate
    controls.autoRotate = false
    controls.enableDamping = false
    controls.update()
    controls.enableDamping = damping
    controls.autoRotate = rotate
  }
  function move(to: THREE.Vector3, target: THREE.Vector3, arc = false) {
    settleControls()
    if (arc) controls.autoRotate = false
    transition = {
      from: camera.position.clone(),
      to,
      targetFrom: controls.target.clone(),
      targetTo: target,
      elapsed: 0,
      arc,
      duration: TRANSITION_SECONDS,
    }
    if (TRANSITION_SECONDS === 0) {
      applyTransition(0)
      controls.update()
      cameraPrevious.copy(camera.position)
    }
  }
  const offset = new THREE.Vector3()
  const spherical = new THREE.Spherical()

  return {
    tick,
    facts,
    state: () => {
      spherical.setFromVector3(offset.copy(camera.position).sub(controls.target))
      return {
        azimuth: spherical.theta,
        polar: spherical.phi,
        distance: spherical.radius,
        target: controls.target.toArray() as [number, number, number],
        night,
        targetNight: targetNight as 0 | 1,
        rotating: controls.autoRotate,
        transition: transition !== null,
        cameraClear,
        time: simTime,
      }
    },
    setNight: (v) => {
      targetNight = v ? 1 : 0
      if (options.reducedMotion) night = targetNight
    },
    setRotate: (v) => (controls.autoRotate = v),
    reset: () => move(HOME.clone(), HOME_TARGET.clone(), true),
    home: () => {
      settleControls()
      transition = null
      controls.autoRotate = false
      camera.position.copy(HOME)
      controls.target.copy(HOME_TARGET)
      controls.update()
      cameraPrevious.copy(camera.position)
      targetNight = 0
      night = 0
    },
    focus: (i) => {
      const site: LandmarkSite = LANDMARKS[i]
      const target = new THREE.Vector3(site.x, site.look, site.z)
      move(target.clone().add(new THREE.Vector3(...site.offset)), target, true)
    },
    zoom: (factor) => {
      const current = camera.position.clone().sub(controls.target)
      current.multiplyScalar(factor)
      current.clampLength(3, 70)
      move(controls.target.clone().add(current), controls.target.clone())
    },
    orbitBy: (dTheta, dPhi) => {
      settleControls()
      transition = null
      spherical.setFromVector3(offset.copy(camera.position).sub(controls.target))
      spherical.theta += dTheta
      spherical.phi = THREE.MathUtils.clamp(spherical.phi + dPhi, controls.minPolarAngle, controls.maxPolarAngle)
      camera.position.copy(controls.target).add(offset.setFromSpherical(spherical))
      controls.update()
      cameraPrevious.copy(camera.position)
    },
    panBy: (dx, dz) => {
      settleControls()
      transition = null
      offset.set(dx, 0, dz)
      controls.target.add(offset)
      camera.position.add(offset)
      controls.update()
      cameraPrevious.copy(camera.position)
    },
    screenshot: () => {
      renderer.render(scene, camera)
      return renderer.domElement.toDataURL('image/png')
    },
    dispose: () => {
      disposed = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      controls.dispose()
      kit.dispose()
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose()
          const mats = Array.isArray(o.material) ? o.material : [o.material]
          mats.forEach((m) => m.dispose())
        }
      })
      environment.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    },
  }
}

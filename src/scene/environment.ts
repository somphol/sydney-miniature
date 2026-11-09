import * as THREE from 'three'
import {
  ISLAND,
  LAND_Y,
  NORTH_LAND,
  PARKS,
  PLAZAS,
  ROAD_Y,
  SOUTH_LAND,
  TRAY,
  WATER_Y,
  pointInPolygon,
  type Park,
  type Point,
} from './geo'
import type { Plan, Route } from './plan'

export interface Urban {
  update: (time: number, night: number) => void
  walks: Point[][]
  water: THREE.Mesh
}

const DAY_WATER = new THREE.Color('#23616f')
const NIGHT_WATER = new THREE.Color('#143746')
const LAND = new THREE.Color('#d8c9a7')
const NIGHT_LAND = new THREE.Color('#26333a')
const GREEN = new THREE.Color('#708b5c')
const NIGHT_GREEN = new THREE.Color('#25382b')

let seed = 4211
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 4294967296
}

function shapeFrom(points: Point[]) {
  const shape = new THREE.Shape()
  points.forEach(([x, z], i) => (i ? shape.lineTo(x, -z) : shape.moveTo(x, -z)))
  shape.closePath()
  return shape
}

function landSlab(points: Point[], top: number, bottom: number, color: string) {
  const shape = shapeFrom(points)
  const g = new THREE.ExtrudeGeometry(shape, { depth: top - bottom, bevelEnabled: false, curveSegments: 2 })
  g.rotateX(-Math.PI / 2)
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 0.94, metalness: 0.02 }))
  m.position.y = bottom
  m.receiveShadow = true
  m.castShadow = true
  return m
}

function parkMesh(park: Park) {
  const g = new THREE.ShapeGeometry(shapeFrom(park.points), 2)
  g.rotateX(-Math.PI / 2)
  const m = new THREE.Mesh(
    g,
    new THREE.MeshStandardMaterial({
      color: park.kind === 'hill' ? '#657c50' : GREEN,
      roughness: 0.95,
      metalness: 0,
    }),
  )
  m.position.y = LAND_Y + 0.012
  m.receiveShadow = true
  m.userData.park = true
  return m
}

export function buildEnvironment(scene: THREE.Scene, plan: Plan): Urban {
  // Tray base and water.
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(TRAY.w + 0.7, 0.5, TRAY.d + 0.7),
    new THREE.MeshStandardMaterial({ color: '#7d7566', roughness: 0.9 }),
  )
  base.position.y = -0.1
  base.receiveShadow = true
  base.castShadow = true
  scene.add(base)

  const waterMat = new THREE.MeshStandardMaterial({
    color: DAY_WATER.clone(),
    roughness: 0.16,
    metalness: 0.46,
    transparent: true,
    opacity: 0.95,
    envMapIntensity: 0.8,
    emissive: new THREE.Color('#1b4050'),
    emissiveIntensity: 0,
  })
  const water = new THREE.Mesh(new THREE.PlaneGeometry(TRAY.w + 0.4, TRAY.d + 0.4), waterMat)
  water.rotation.x = -Math.PI / 2
  water.position.y = WATER_Y
  water.receiveShadow = true
  scene.add(water)
  const waveMat = new THREE.MeshBasicMaterial({ color: '#c6e3e0', transparent: true, opacity: 0.055 })
  const waves = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 0.018), waveMat, 70)
  const waveObj = new THREE.Object3D()
  for (let i = 0; i < 70; i++) {
    waveObj.position.set(-12 + rand() * 24, WATER_Y + 0.006, -7.5 + rand() * 8)
    waveObj.rotation.set(-Math.PI / 2, 0, rand() * Math.PI)
    waveObj.scale.set(0.7 + rand() * 2.8, 1, 1)
    waveObj.updateMatrix()
    waves.setMatrixAt(i, waveObj.matrix)
  }
  waves.instanceMatrix.needsUpdate = true
  waves.frustumCulled = false
  scene.add(waves)
  const wakeMat = new THREE.MeshBasicMaterial({ color: '#e8f4f0', transparent: true, opacity: 0.12 })
  const wakes = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 0.05), wakeMat, 10)
  for (let i = 0; i < 10; i++) {
    waveObj.position.set(-8 + rand() * 16, WATER_Y + 0.008, -5.5 + rand() * 4)
    waveObj.rotation.set(-Math.PI / 2, 0, rand() * Math.PI)
    waveObj.scale.set(0.4 + rand() * 1.1, 1, 1)
    waveObj.updateMatrix()
    wakes.setMatrixAt(i, waveObj.matrix)
  }
  wakes.instanceMatrix.needsUpdate = true
  wakes.frustumCulled = false
  scene.add(wakes)

  const south = landSlab(SOUTH_LAND, LAND_Y, 0.26, '#d8c9a7')
  const north = landSlab(NORTH_LAND, LAND_Y, 0.26, '#d2c19d')
  scene.add(south, north)
  const island = new THREE.Mesh(
    new THREE.CylinderGeometry(ISLAND.r, ISLAND.r + 0.06, 0.28, 20),
    new THREE.MeshStandardMaterial({ color: '#8f8671', roughness: 0.95 }),
  )
  island.position.set(ISLAND.x, WATER_Y + 0.14, ISLAND.z)
  island.receiveShadow = true
  scene.add(island)

  // Stone plazas at Circular Quay, Bennelong Point and the ferry terminals.
  PLAZAS.forEach((plaza) => {
    const g = new THREE.ShapeGeometry(shapeFrom(plaza.points), 2)
    g.rotateX(-Math.PI / 2)
    const m = new THREE.Mesh(
      g,
      new THREE.MeshStandardMaterial({ color: '#d3c5a8', roughness: 0.92, metalness: 0.01 }),
    )
    m.position.y = LAND_Y + 0.01
    m.receiveShadow = true
    scene.add(m)
  })

  // Parks, with a lighter edge so the green reads at overview distance.
  PARKS.forEach((park) => {
    scene.add(parkMesh(park))
    const edge = new THREE.Mesh(
      new THREE.RingGeometry(0.02, 0.05, 4),
      new THREE.MeshBasicMaterial({ color: '#95a77b', side: THREE.DoubleSide, transparent: true, opacity: 0.4 }),
    )
    edge.visible = false
    scene.add(edge)
  })

  // Roads: one instanced box per graph edge.
  const roadMat = new THREE.MeshStandardMaterial({ color: '#5b5d58', roughness: 0.94, metalness: 0.02 })
  const roads = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), roadMat, plan.edges.length)
  const obj = new THREE.Object3D()
  plan.edges.forEach((edge, i) => {
    const a = plan.nodes[edge.a]
    const b = plan.nodes[edge.b]
    const dx = b[0] - a[0]
    const dz = b[1] - a[1]
    const len = Math.hypot(dx, dz)
    obj.position.set((a[0] + b[0]) / 2, ROAD_Y, (a[1] + b[1]) / 2)
    obj.rotation.set(0, -Math.atan2(dz, dx), 0)
    obj.scale.set(len + 0.02, 0.035, edge.width)
    obj.updateMatrix()
    roads.setMatrixAt(i, obj.matrix)
  })
  roads.instanceMatrix.needsUpdate = true
  roads.receiveShadow = true
  roads.frustumCulled = false
  scene.add(roads)

  // Kerb highlight on the major roads; subtle but helps the grid read.
  const major = plan.edges.filter((e) => e.width > 0.15)
  const kerbs = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: '#a9a18e', roughness: 0.9 }),
    major.length * 2,
  )
  major.forEach((edge, i) => {
    const a = plan.nodes[edge.a]
    const b = plan.nodes[edge.b]
    const dx = b[0] - a[0]
    const dz = b[1] - a[1]
    const len = Math.hypot(dx, dz)
    for (let side = 0; side < 2; side++) {
      obj.position.set((a[0] + b[0]) / 2, ROAD_Y + 0.005, (a[1] + b[1]) / 2)
      obj.rotation.set(0, -Math.atan2(dz, dx), 0)
      obj.scale.set(len, 0.02, 0.018)
      obj.translateZ((side ? 1 : -1) * (edge.width / 2 + 0.02))
      obj.updateMatrix()
      kerbs.setMatrixAt(i * 2 + side, obj.matrix)
    }
  })
  kerbs.instanceMatrix.needsUpdate = true
  kerbs.frustumCulled = false
  scene.add(kerbs)

  // Trees: trunks and canopies in the parks, plus a few street figs.
  const treeSpots: { x: number; z: number; s: number; tone: number }[] = []
  PARKS.forEach((park) => {
    const xs = park.points.map((p) => p[0])
    const zs = park.points.map((p) => p[1])
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minZ = Math.min(...zs)
    const maxZ = Math.max(...zs)
    const target = Math.round((maxX - minX) * (maxZ - minZ) * park.treeDensity * 5)
    for (let i = 0; i < target; i++) {
      const x = minX + rand() * (maxX - minX)
      const z = minZ + rand() * (maxZ - minZ)
      if (!pointInPolygon(x, z, park.points)) continue
      treeSpots.push({ x, z, s: 0.7 + rand() * 0.7, tone: rand() })
    }
  })
  for (let i = 0; i < 24; i++) {
    const route = plan.routes[i % plan.routes.length]
    if (!route) break
    const p = route.pts[Math.floor(rand() * route.pts.length)]
    treeSpots.push({ x: p[0] + (rand() - 0.5) * 0.5, z: p[1] + (rand() - 0.5) * 0.5, s: 0.65 + rand() * 0.5, tone: rand() })
  }
  const trunk = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.018, 0.028, 0.26, 5),
    new THREE.MeshStandardMaterial({ color: '#6b5540', roughness: 0.95 }),
    treeSpots.length,
  )
  const canopy = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.2, 0),
    new THREE.MeshStandardMaterial({ color: '#5d7a4f', roughness: 0.92 }),
    treeSpots.length,
  )
  treeSpots.forEach((t, i) => {
    obj.position.set(t.x, LAND_Y + 0.13 * t.s, t.z)
    obj.rotation.set(0, rand() * Math.PI, 0)
    obj.scale.set(t.s, t.s, t.s)
    obj.updateMatrix()
    trunk.setMatrixAt(i, obj.matrix)
    obj.position.set(t.x, LAND_Y + 0.3 * t.s, t.z)
    obj.scale.set(t.s * (0.85 + rand() * 0.5), t.s * (0.8 + rand() * 0.5), t.s * (0.85 + rand() * 0.5))
    obj.updateMatrix()
    canopy.setMatrixAt(i, obj.matrix)
    canopy.setColorAt(i, new THREE.Color().setHSL(0.26 + t.tone * 0.04, 0.24 + t.tone * 0.1, 0.3 + t.tone * 0.1))
  })
  trunk.instanceMatrix.needsUpdate = true
  canopy.instanceMatrix.needsUpdate = true
  if (canopy.instanceColor) canopy.instanceColor.needsUpdate = true
  trunk.frustumCulled = false
  canopy.frustumCulled = false
  scene.add(trunk, canopy)

  // Ferry wharves along the Circular Quay edge and at Milsons Point / Barangaroo.
  const wharfMat = new THREE.MeshStandardMaterial({ color: '#9a8c70', roughness: 0.9 })
  const roofMat = new THREE.MeshStandardMaterial({ color: '#1f6b57', roughness: 0.7, metalness: 0.15 })
  const wharves: { x: number; z: number; w: number; d: number; ry: number }[] = [
    { x: -2.25, z: -1.65, w: 0.72, d: 0.34, ry: 0.12 },
    { x: -1.55, z: -1.42, w: 0.6, d: 0.3, ry: -0.08 },
    { x: -2.95, z: -1.2, w: 0.58, d: 0.3, ry: 0.3 },
    { x: -5.9, z: -3.85, w: 0.56, d: 0.3, ry: 0.18 },
    { x: -9.4, z: 0.2, w: 0.5, d: 0.28, ry: -0.4 },
  ]
  wharves.forEach((w) => {
    const deck = new THREE.Mesh(new THREE.BoxGeometry(w.w, 0.06, w.d), wharfMat)
    deck.position.set(w.x, WATER_Y + 0.13, w.z)
    deck.rotation.y = w.ry
    deck.receiveShadow = true
    deck.castShadow = true
    scene.add(deck)
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w.w * 1.05, 0.05, w.d * 0.75), roofMat)
    roof.position.set(w.x, WATER_Y + 0.46, w.z)
    roof.rotation.y = w.ry
    roof.castShadow = true
    scene.add(roof)
    for (const sx of [-0.42, 0.42]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.3, 0.025), wharfMat)
      post.position.set(w.x + Math.cos(w.ry) * w.w * sx, WATER_Y + 0.3, w.z - Math.sin(w.ry) * w.w * sx)
      scene.add(post)
    }
  })

  // Harbour lamps: instanced poles with warm globes.
  const lampSpots: Point[] = []
  plan.routes.forEach((route) => {
    if (route.bridge) return
    for (let i = 0; i < route.pts.length - 1; i += 2) lampSpots.push(route.pts[i])
  })
  const lampPole = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.018, 0.025, 0.36, 5),
    new THREE.MeshStandardMaterial({ color: '#263d3a', roughness: 0.8 }),
    lampSpots.length,
  )
  const lampGlowMat = new THREE.MeshStandardMaterial({
    color: '#fff0c8',
    emissive: new THREE.Color('#ffd79a'),
    emissiveIntensity: 0,
    roughness: 0.35,
  })
  const lampGlobe = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 8, 6), lampGlowMat, lampSpots.length)
  lampSpots.forEach((p, i) => {
    obj.position.set(p[0], LAND_Y + 0.18, p[1])
    obj.rotation.set(0, 0, 0)
    obj.scale.set(1, 1, 1)
    obj.updateMatrix()
    lampPole.setMatrixAt(i, obj.matrix)
    obj.position.set(p[0], LAND_Y + 0.38, p[1])
    obj.updateMatrix()
    lampGlobe.setMatrixAt(i, obj.matrix)
  })
  lampPole.instanceMatrix.needsUpdate = true
  lampGlobe.instanceMatrix.needsUpdate = true
  lampPole.frustumCulled = false
  lampGlobe.frustumCulled = false
  scene.add(lampPole, lampGlobe)

  const pointLights: THREE.PointLight[] = []
  for (const [x, z] of [
    [-1.9, -1.1],
    [-0.4, 1.1],
    [-9.1, 1.2],
    [-5.7, -4.2],
    [1.3, 3.8],
    [0.4, 2.6],
  ]) {
    const light = new THREE.PointLight('#ffcf8d', 0, 5.5, 2)
    light.position.set(x, 1.2, z)
    scene.add(light)
    pointLights.push(light)
  }

  const walks: Point[][] = [
    [[-2.65, -1.15], [-1.8, -0.95], [-0.9, -0.7], [0.0, -0.25], [0.8, 0.3], [1.5, 0.9]],
    [[0.55, 0.65], [1.25, 0.85], [2.1, 1.1], [3.0, 1.35], [3.5, 1.95]],
    [[-9.55, 0.35], [-9.15, 1.05], [-8.85, 1.85], [-8.6, 2.7]],
    [[-4.3, 2.05], [-4.55, 1.15], [-4.72, 0.25], [-4.9, -0.75], [-5.0, -1.85], [-5.02, -2.9], [-4.8, -3.9], [-4.45, -4.6]],
    [[0.25, 3.2], [1.2, 3.35], [2.2, 3.5], [3.15, 3.7]],
    [[-6.3, -4.45], [-5.55, -4.35], [-4.8, -4.35], [-4.05, -4.45]],
  ]

  const dayPark = new THREE.Color('#708b5c')
  const nightPark = new THREE.Color('#25382b')
  const update = (time: number, night: number) => {
    waterMat.color.copy(DAY_WATER).lerp(NIGHT_WATER, night)
    waterMat.opacity = 0.95 - 0.1 * night
    ;(south.material as THREE.MeshStandardMaterial).color.copy(LAND).lerp(NIGHT_LAND, night)
    ;(north.material as THREE.MeshStandardMaterial).color.copy(LAND).lerp(NIGHT_LAND, night)
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh && o.userData.park && o.geometry instanceof THREE.ShapeGeometry) {
        const mat = o.material as THREE.MeshStandardMaterial
        if (mat.color) mat.color.copy(dayPark).lerp(nightPark, night)
      }
    })
    lampGlowMat.emissiveIntensity = 3.2 * night
    pointLights.forEach((light, i) => {
      light.intensity = night * (2.0 + 0.25 * Math.sin(time * 0.6 + i))
    })
    base.material instanceof THREE.MeshStandardMaterial &&
      base.material.color.set('#7d7566').lerp(new THREE.Color('#1c242b'), night)
    waterMat.roughness = 0.16 + night * 0.1
    waterMat.emissiveIntensity = night * 0.5
  }

  return { update, walks, water }
}

import * as THREE from 'three'
import { LAND_Y, WATER_Y, type Point } from './geo'
import type { Plan, Route } from './plan'

type VehicleType = 'tram' | 'train' | 'bus' | 'taxi' | 'car' | 'van'
type BoatType = 'ferry' | 'yacht' | 'cruise' | 'tug'

interface Mover {
  path: Point[]
  lengths: number[]
  total: number
  s: number
  speed: number
  offset: number
  color: string
}

export interface Traffic {
  vehicles: Mover[]
  boats: Mover[]
  people: Mover[]
  update: (dt: number, time: number, night: number) => void
}

const COLORS = {
  tram: '#c7493f',
  train: '#c7ccce',
  bus: '#2f6f9b',
  taxi: '#e0b84d',
  car: ['#d9d5c9', '#5c6c72', '#2f4f63', '#9a4c44', '#c8c3b5', '#3c4a4b'],
  van: '#e6e2d6',
  ferry: '#2d7d5e',
  yacht: '#f0ece0',
  cruise: '#e5e1d3',
  tug: '#b45a43',
}

function makeMover(path: Point[], speed: number, offset: number, color: string, t = 0): Mover {
  const lengths: number[] = []
  let total = 0
  for (let i = 0; i < path.length - 1; i++) {
    const l = Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1])
    lengths.push(l)
    total += l
  }
  return { path, lengths, total, s: t * total, speed, offset, color }
}

function position(m: Mover) {
  let d = ((m.s % m.total) + m.total) % m.total
  for (let i = 0; i < m.lengths.length; i++) {
    if (d <= m.lengths[i]) {
      const a = m.path[i]
      const b = m.path[i + 1]
      const t = m.lengths[i] > 0 ? d / m.lengths[i] : 0
      const x = a[0] + (b[0] - a[0]) * t
      const z = a[1] + (b[1] - a[1]) * t
      const dx = b[0] - a[0]
      const dz = b[1] - a[1]
      const len = Math.hypot(dx, dz) || 1
      return { x: x + (-dz / len) * m.offset, z: z + (dx / len) * m.offset, yaw: -Math.atan2(dz, dx) }
    }
    d -= m.lengths[i]
  }
  const p = m.path[m.path.length - 1]
  return { x: p[0], z: p[1], yaw: 0 }
}

function boost(route: Route): Point[] {
  return route.pts
}

export function addCityLife(scene: THREE.Scene, plan: Plan, walks: Point[][]): Traffic {
  const carRoutes = plan.routes.filter((r) => !r.bridge && r.pts.length >= 2 && r.width >= 0.085)
  const bridgeRoute = plan.routes.find((r) => r.bridge)
  const george = plan.routes.find((r) => r.id === 'cbd--2.4') ?? carRoutes[0]
  const tramRoute = george ?? carRoutes[0]
  const vehicles: Mover[] = []
  const vehicleTypes: VehicleType[] = []
  const addVehicle = (type: VehicleType, route: Route, speed: number, t: number) => {
    const color =
      type === 'car'
        ? COLORS.car[vehicles.length % COLORS.car.length]
        : (COLORS[type] as string)
    vehicles.push(makeMover(boost(route), speed, (vehicles.length % 2 ? 1 : -1) * 0.035, color, t))
    vehicleTypes.push(type)
  }
  if (tramRoute) for (let i = 0; i < 5; i++) addVehicle('tram', tramRoute, 0.5 + i * 0.02, i / 5)
  if (bridgeRoute) for (let i = 0; i < 2; i++) addVehicle('train', bridgeRoute, 0.75, i / 2)
  for (let i = 0; i < 6 && carRoutes.length; i++) addVehicle('bus', carRoutes[i % carRoutes.length], 0.42, i / 6)
  for (let i = 0; i < 9 && carRoutes.length; i++) addVehicle('taxi', carRoutes[(i * 3) % carRoutes.length], 0.55, i / 9)
  for (let i = 0; i < 16 && carRoutes.length; i++) addVehicle('car', carRoutes[(i * 5 + 1) % carRoutes.length], 0.48 + (i % 4) * 0.04, (i * 0.17) % 1)
  for (let i = 0; i < 6 && carRoutes.length; i++) addVehicle('van', carRoutes[(i * 7 + 2) % carRoutes.length], 0.4, (i * 0.23) % 1)

  const waterPaths: { path: Point[]; speed: number; color: string; type: BoatType }[] = [
    {
      path: [[-2.1, -1.45], [0.2, -2.0], [2.4, -2.75], [2.7, -3.35], [2.2, -2.6], [0.2, -1.9], [-2.0, -1.4]],
      speed: 0.42,
      color: COLORS.ferry,
      type: 'ferry',
    },
    {
      path: [[-5.7, -3.85], [-4.2, -3.0], [-2.4, -2.3], [-1.4, -1.75], [-2.2, -2.1], [-3.8, -2.9], [-5.5, -3.7]],
      speed: 0.4,
      color: COLORS.ferry,
      type: 'ferry',
    },
    {
      path: [[-1.2, -1.5], [1.0, -2.2], [3.4, -3.2], [5.6, -4.2], [7.4, -4.9], [5.0, -4.1], [2.8, -3.2], [0.4, -2.2], [-1.3, -1.5]],
      speed: 0.34,
      color: COLORS.ferry,
      type: 'ferry',
    },
    {
      path: [[-8.5, -1.8], [-6.0, -2.3], [-3.0, -2.8], [0.0, -3.0], [3.0, -3.8], [6.0, -4.6]],
      speed: 0.28,
      color: COLORS.ferry,
      type: 'ferry',
    },
    {
      path: [[0.4, -2.3], [2.4, -2.0], [4.6, -2.8], [6.2, -4.0], [5.0, -4.4], [2.6, -3.6], [0.6, -3.0]],
      speed: 0.3,
      color: COLORS.yacht,
      type: 'yacht',
    },
    {
      path: [[-6.8, -2.2], [-4.4, -2.5], [-2.0, -2.7], [0.4, -3.2], [-2.0, -3.4], [-4.8, -2.9], [-7.0, -2.4]],
      speed: 0.36,
      color: COLORS.yacht,
      type: 'yacht',
    },
    {
      path: [[-9.0, -1.2], [-6.5, -1.9], [-4.0, -2.4], [-1.5, -2.7], [-4.2, -2.8], [-7.0, -2.1], [-9.2, -1.4]],
      speed: 0.24,
      color: COLORS.cruise,
      type: 'cruise',
    },
    {
      path: [[-8.2, -1.4], [-7.4, -2.1], [-6.8, -2.8], [-7.6, -2.5], [-8.4, -1.9]],
      speed: 0.2,
      color: COLORS.tug,
      type: 'tug',
    },
  ]
  const boats: Mover[] = []
  const boatTypes: BoatType[] = []
  waterPaths.forEach((w, i) => {
    boats.push(makeMover(w.path, w.speed, 0, w.color, (i * 0.19) % 1))
    boatTypes.push(w.type)
  })

  const people: Mover[] = []
  const peopleColors = ['#d9c8ad', '#3d5a6b', '#b65a48', '#e4dfd1', '#4f6c55', '#c9a15c']
  for (let i = 0; i < 64; i++) {
    const walk = walks[i % walks.length]
    const path = i % 2 ? walk : [...walk].reverse()
    people.push(
      makeMover(
        path,
        0.06 + (i % 5) * 0.012,
        ((i % 3) - 1) * 0.05,
        peopleColors[i % peopleColors.length],
        (i * 0.127) % 1,
      ),
    )
  }

  const geo = new THREE.BoxGeometry(1, 1, 1)
  const makeMesh = (count: number, material: THREE.MeshStandardMaterial) => {
    const mesh = new THREE.InstancedMesh(geo, material, count)
    mesh.frustumCulled = false
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)
    return mesh
  }
  const vehicleMats = {
    tram: new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.25 }),
    train: new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.4 }),
    bus: new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.2 }),
    taxi: new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.2 }),
    car: new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.35 }),
    van: new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.15 }),
  }
  const vehicleMeshes = Object.fromEntries(
    (Object.keys(vehicleMats) as VehicleType[]).map((type) => {
      const count = vehicleTypes.filter((t) => t === type).length
      return [type, count ? makeMesh(count, vehicleMats[type]) : null]
    }),
  ) as Record<VehicleType, THREE.InstancedMesh | null>
  const boatMesh = makeMesh(boats.length, new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.25 }))
  const peopleMesh = makeMesh(people.length, new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02 }))
  const indices: Record<VehicleType, number> = { tram: 0, train: 0, bus: 0, taxi: 0, car: 0, van: 0 }

  vehicles.forEach((v, i) => {
    const mesh = vehicleMeshes[vehicleTypes[i]]
    if (mesh) mesh.setColorAt(indices[vehicleTypes[i]]++, new THREE.Color(v.color))
  })
  boats.forEach((b, i) => boatMesh.setColorAt(i, new THREE.Color(b.color)))
  people.forEach((p, i) => peopleMesh.setColorAt(i, new THREE.Color(p.color)))
  Object.values(vehicleMeshes).forEach((m) => m && m.instanceColor && (m.instanceColor.needsUpdate = true))
  if (boatMesh.instanceColor) boatMesh.instanceColor.needsUpdate = true
  if (peopleMesh.instanceColor) peopleMesh.instanceColor.needsUpdate = true

  const obj = new THREE.Object3D()
  const sizes: Record<VehicleType, [number, number, number]> = {
    tram: [0.44, 0.14, 0.1],
    train: [0.52, 0.16, 0.105],
    bus: [0.3, 0.13, 0.1],
    taxi: [0.22, 0.085, 0.08],
    car: [0.19, 0.08, 0.075],
    van: [0.24, 0.11, 0.085],
  }
  const boatSizes: Record<BoatType, [number, number, number]> = {
    ferry: [0.4, 0.08, 0.13],
    yacht: [0.24, 0.06, 0.08],
    cruise: [0.48, 0.1, 0.14],
    tug: [0.2, 0.07, 0.09],
  }

  const update = (dt: number, time: number, night: number) => {
    vehicles.forEach((v, i) => {
      v.s += v.speed * dt
      const p = position(v)
      const mesh = vehicleMeshes[vehicleTypes[i]]
      if (!mesh) return
      const idx = vehicleTypes.slice(0, i).filter((t) => t === vehicleTypes[i]).length
      const [l, h, w] = sizes[vehicleTypes[i]]
      obj.position.set(p.x, LAND_Y + h / 2 + 0.035, p.z)
      obj.rotation.set(0, p.yaw, 0)
      obj.scale.set(l, h, w)
      obj.updateMatrix()
      mesh.setMatrixAt(idx, obj.matrix)
    })
    Object.entries(vehicleMeshes).forEach(([type, mesh]) => {
      if (!mesh) return
      mesh.instanceMatrix.needsUpdate = true
      const mat = vehicleMats[type as VehicleType]
      mat.emissive.set(night > 0.5 ? '#3a2a17' : '#000000')
      mat.emissiveIntensity = night * 0.4
    })
    boats.forEach((b, i) => {
      b.s += b.speed * dt
      const p = position(b)
      const type = boatTypes[i]
      const [l, h, w] = boatSizes[type]
      obj.position.set(p.x, WATER_Y + h / 2 + 0.02, p.z)
      obj.rotation.set(0, p.yaw, 0)
      obj.scale.set(l, h, w)
      obj.updateMatrix()
      boatMesh.setMatrixAt(i, obj.matrix)
    })
    boatMesh.instanceMatrix.needsUpdate = true
    people.forEach((p, i) => {
      p.s += p.speed * dt
      const at = position(p)
      obj.position.set(at.x, LAND_Y + 0.05, at.z)
      obj.rotation.set(0, at.yaw, 0)
      obj.scale.set(0.032, 0.09, 0.032)
      obj.updateMatrix()
      peopleMesh.setMatrixAt(i, obj.matrix)
    })
    peopleMesh.instanceMatrix.needsUpdate = true
    peopleMesh.visible = true
    if (night > 0.2) {
      const pulse = 0.9 + Math.sin(time * 1.7) * 0.1
      boatMesh.material instanceof THREE.MeshStandardMaterial &&
        (boatMesh.material.emissiveIntensity = night * 0.15 * pulse)
    }
  }

  return { vehicles, boats, people, update }
}

import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { LANDMARKS, LAND_Y, type LandmarkSite } from './geo'

export interface Envelope {
  w: number
  d: number
  minY: number
  maxY: number
}

export const LANDMARK_ENVELOPES: Record<string, Envelope> = {
  'opera-house': { w: 2.3, d: 1.8, minY: 0.5, maxY: 2.4 },
  'harbour-bridge': { w: 1.5, d: 5.2, minY: 0.5, maxY: 3.3 },
  'sydney-tower': { w: 0.85, d: 0.85, minY: 0.5, maxY: 3.7 },
  qvb: { w: 1.9, d: 1.2, minY: 0.5, maxY: 1.8 },
  'st-marys': { w: 1.2, d: 1.8, minY: 0.5, maxY: 2.7 },
  'luna-park': { w: 1.5, d: 1.3, minY: 0.5, maxY: 2.1 },
  'fort-denison': { w: 1.1, d: 1.1, minY: 0.5, maxY: 1.8 },
  observatory: { w: 1.2, d: 1.2, minY: 0.5, maxY: 2.0 },
}

const cache = new Map<string, THREE.MeshStandardMaterial>()
function mat(color: string, rough = 0.72, metal = 0.08, emissive = '#000000', emissiveIntensity = 0) {
  const key = `${color}|${rough}|${metal}|${emissive}|${emissiveIntensity}`
  if (cache.has(key)) return cache.get(key)!
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness: rough,
    metalness: metal,
    emissive: new THREE.Color(emissive),
    emissiveIntensity,
  })
  cache.set(key, m)
  return m
}

function mesh(group: THREE.Group, g: THREE.BufferGeometry, color: string, x = 0, y = 0, z = 0, opts?: { rough?: number; metal?: number; emissive?: string; emissiveIntensity?: number }) {
  if (!g.getAttribute('normal')) g.computeVertexNormals()
  if (!g.getAttribute('uv')) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.getAttribute('position').count * 2), 2))
  const m = new THREE.Mesh(g, mat(color, opts?.rough, opts?.metal, opts?.emissive, opts?.emissiveIntensity))
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  group.add(m)
  return m
}

function box(group: THREE.Group, w: number, h: number, d: number, color: string, x = 0, y = 0, z = 0, ry = 0) {
  return mesh(group, new THREE.BoxGeometry(w, h, d), color, x, y, z).rotateY(ry)
}

function cyl(group: THREE.Group, r: number, h: number, color: string, x = 0, y = 0, z = 0, top = r, sides = 16) {
  return mesh(group, new THREE.CylinderGeometry(top, r, h, sides), color, x, y, z)
}

function sphere(group: THREE.Group, r: number, color: string, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) {
  const m = mesh(group, new THREE.SphereGeometry(r, 16, 10), color, x, y, z)
  m.scale.set(sx, sy, sz)
  return m
}

function dome(group: THREE.Group, r: number, color: string, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) {
  const g = new THREE.SphereGeometry(r, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2)
  const m = mesh(group, g, color, x, y, z)
  m.scale.set(sx, sy, sz)
  return m
}

function beam(group: THREE.Group, a: THREE.Vector3, b: THREE.Vector3, r: number, color: string, metal = 0.55) {
  const v = b.clone().sub(a)
  const g = new THREE.CylinderGeometry(r, r, v.length(), 6)
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize()))
  return mesh(group, g, color, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, { metal })
}

function arch(group: THREE.Group, x: number, y0: number, z0: number, z1: number, rise: number, color: string) {
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(x, y0, z0),
    new THREE.Vector3(x, y0 + rise * 2, (z0 + z1) / 2),
    new THREE.Vector3(x, y0, z1),
  )
  return mesh(group, new THREE.TubeGeometry(curve, 24, 0.055, 6, false), color, 0, 0, 0, { metal: 0.65 })
}

function operaHouse(g: THREE.Group) {
  // Bennelong Point podium and steps.
  box(g, 1.9, 0.14, 1.42, '#cbb488', 0, 0.07, 0)
  box(g, 1.72, 0.08, 1.26, '#ddc79d', 0, 0.18, 0)
  box(g, 1.5, 0.06, 1.06, '#e8d6b2', 0, 0.25, 0)
  const sail = (x: number, z: number, w: number, h: number, ry: number, mirror: boolean) => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.quadraticCurveTo(w * 0.28, h * 1.02, w, h * 0.55)
    shape.quadraticCurveTo(w * 0.55, h * 0.2, 0, 0)
    shape.closePath()
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      bevelSegments: 1,
      curveSegments: 8,
    })
    geo.translate(-w / 2, 0, -0.07)
    const m = mesh(g, geo, '#f5f1e4', x, 0.27, z)
    m.rotation.y = ry
    if (mirror) m.scale.x = -1
    return m
  }
  sail(-0.55, 0.12, 0.5, 0.68, 0.14, false)
  sail(-0.2, 0.02, 0.66, 1.12, 0.05, false)
  sail(0.18, 0.05, 0.62, 0.98, -0.04, true)
  sail(0.52, 0.16, 0.44, 0.64, -0.12, true)
  // The glass curtain wall under the shells.
  box(g, 0.92, 0.4, 0.08, '#3c5963', 0, 0.48, 0.52)
  box(g, 0.8, 0.03, 0.1, '#b9c8c4', 0, 0.7, 0.53)
  for (let i = 0; i < 3; i++) box(g, 0.56, 0.02, 0.04, '#8fa6a3', 0, 0.34 + i * 0.12, 0.56)
  // Northern foyer, lower and darker.
  box(g, 0.5, 0.3, 0.24, '#46626a', 0.35, 0.4, -0.42)
}

function harbourBridge(g: THREE.Group) {
  const steel = '#8e999d'
  const stone = '#c7b28c'
  box(g, 0.62, 0.13, 5.2, '#59605e', 0, 0.72, 0)
  box(g, 0.56, 0.06, 5.2, '#3c4343', 0, 0.8, 0)
  box(g, 0.3, 0.03, 5.0, '#7c7062', 0, 0.84, 0)
  const archZ = 2.35
  arch(g, -0.24, 0.72, -archZ, archZ, 1.9, steel)
  arch(g, 0.24, 0.72, -archZ, archZ, 1.9, steel)
  for (const x of [-0.24, 0.24]) {
    for (let i = 0; i < 9; i++) {
      const t = i / 8
      const z = -archZ + t * archZ * 2
      const y = 0.72 + Math.sin(t * Math.PI) * 1.9
      beam(g, new THREE.Vector3(x, y, z), new THREE.Vector3(x, 0.78, z), 0.018, steel)
    }
  }
  for (const x of [-0.62, 0.62]) {
    for (const z of [-2.15, 2.15]) {
      box(g, 0.3, 1.55, 0.36, stone, x, 0.78, z)
      box(g, 0.34, 0.12, 0.4, '#d8c49f', x, 1.56, z)
      box(g, 0.2, 0.24, 0.26, '#b9a47e', x, 1.68, z)
    }
  }
  box(g, 0.9, 0.1, 0.5, stone, 0, 0.34, -2.15)
  box(g, 0.9, 0.1, 0.5, stone, 0, 0.34, 2.15)
  for (let i = 0; i < 13; i++) {
    box(g, 0.62, 0.018, 0.06, '#a9b4b6', 0, 1.7 + Math.sin((i / 12) * Math.PI) * 0.7, -2.3 + (i / 12) * 4.6)
  }
}

function sydneyTower(g: THREE.Group) {
  box(g, 0.84, 0.32, 0.84, '#b8aa8c', 0, 0.16, 0)
  box(g, 0.7, 0.2, 0.7, '#8e8d80', 0, 0.42, 0)
  box(g, 0.32, 0.5, 0.32, '#b9b3a4', 0, 0.72, 0)
  cyl(g, 0.13, 1.7, '#c7a24d', 0, 1.9, 0, 0.1, 12)
  cyl(g, 0.26, 0.26, '#d8b45c', 0, 2.72, 0, 0.3, 16)
  cyl(g, 0.32, 0.16, '#e7c875', 0, 2.93, 0, 0.28, 16)
  cyl(g, 0.2, 0.22, '#c79c45', 0, 3.08, 0, 0.12, 12)
  box(g, 0.04, 0.35, 0.04, '#d9d5c4', 0, 3.3, 0)
  box(g, 0.018, 0.18, 0.018, '#e8e3d2', 0, 3.52, 0)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    box(g, 0.035, 0.12, 0.035, '#f0dfa8', Math.cos(a) * 0.32, 2.72, Math.sin(a) * 0.32, a)
  }
}

function qvb(g: THREE.Group) {
  box(g, 1.7, 0.82, 0.7, '#c5a97b', 0, 0.51, 0)
  box(g, 1.74, 0.08, 0.74, '#e0c89b', 0, 0.93, 0)
  box(g, 1.72, 0.06, 0.72, '#b59768', 0, 0.16, 0)
  for (let i = 0; i < 7; i++) {
    const x = -0.72 + (i / 6) * 1.44
    box(g, 0.12, 0.42, 0.02, '#6b5a47', x, 0.46, 0.36)
    box(g, 0.15, 0.06, 0.03, '#e3d1ad', x, 0.7, 0.37)
  }
  for (let i = 0; i < 4; i++) {
    const x = -0.6 + i * 0.4
    dome(g, 0.14, '#7f9e83', x, 0.94, 0, 1, 0.65, 1)
  }
  cyl(g, 0.26, 0.16, '#c5a97b', 0, 0.98, 0, 0.28, 12)
  dome(g, 0.28, '#5f8a70', 0, 1.06, 0, 1, 1.1, 1)
  box(g, 0.04, 0.18, 0.04, '#d6c9a8', 0, 1.4, 0)
  box(g, 0.5, 0.18, 0.02, '#d8c49b', 0, 1.05, 0.72)
}

function stMarys(g: THREE.Group) {
  box(g, 0.86, 0.9, 1.55, '#8d7860', 0, 0.55, 0)
  box(g, 0.92, 0.08, 1.6, '#a68d6c', 0, 1.04, 0)
  for (const z of [-0.45, 0.45]) {
    box(g, 0.5, 1.25, 0.5, '#8d7860', 0, 0.72, z)
    cyl(g, 0.2, 0.35, '#7a6752', 0, 1.52, z, 0.2, 8)
    cyl(g, 0.2, 0.75, '#7a6752', 0, 1.95, z, 0.02, 8)
    box(g, 0.04, 0.28, 0.04, '#d9cba9', 0, 2.36, z)
  }
  const roof = new THREE.BufferGeometry()
  const v = new Float32Array([
    -0.45, 1.0, -0.8, 0.45, 1.0, -0.8, 0, 1.4, -0.8,
    -0.45, 1.0, 0.8, 0.45, 1.0, 0.8, 0, 1.4, 0.8,
  ])
  roof.setAttribute('position', new THREE.BufferAttribute(v, 3))
  roof.setIndex([0, 1, 2, 3, 5, 4, 0, 3, 4, 0, 4, 1, 1, 4, 5, 1, 5, 2, 2, 5, 3, 2, 3, 0])
  mesh(g, roof, '#4c5350', 0, 0, 0)
  cyl(g, 0.16, 0.03, '#c7a24d', 0, 1.02, 0.86, 0.16, 16)
  for (const z of [-0.45, 0.45]) box(g, 0.34, 0.44, 0.02, '#5b4e42', 0, 0.66, z + 0.26)
}

function lunaPark(g: THREE.Group) {
  box(g, 1.35, 0.08, 0.98, '#d4c7ad', 0, 0.04, 0)
  box(g, 0.34, 0.9, 0.34, '#e3d3b1', -0.45, 0.53, 0.28)
  box(g, 0.34, 0.9, 0.34, '#e3d3b1', 0.45, 0.53, 0.28)
  box(g, 1.3, 0.1, 0.4, '#c94f42', 0, 1.02, 0.28)
  box(g, 0.92, 0.9, 0.12, '#f0d9a8', 0, 0.55, 0.22)
  for (const x of [-0.28, 0.28]) {
    cyl(g, 0.13, 0.03, '#24333a', x, 0.7, 0.3, 0.13, 14)
    cyl(g, 0.06, 0.04, '#f4e7c4', x, 0.71, 0.31, 0.06, 12)
  }
  const smile = new THREE.TorusGeometry(0.2, 0.025, 6, 12, Math.PI)
  const m = mesh(g, smile, '#c94f42', 0, 0.48, 0.3)
  m.rotation.z = Math.PI
  box(g, 0.12, 0.14, 0.02, '#c94f42', 0, 0.82, 0.3)
  const wheelX = 0.18
  const wheelY = 1.2
  const wheelZ = -0.22
  const torus = new THREE.TorusGeometry(0.43, 0.026, 6, 24)
  const wheel = mesh(g, torus, '#d8b45c', wheelX, wheelY, wheelZ)
  wheel.rotation.y = Math.PI / 2
  const hub = new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8)
  const hm = mesh(g, hub, '#8e7a4e', wheelX, wheelY, wheelZ)
  hm.rotation.z = Math.PI / 2
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    beam(
      g,
      new THREE.Vector3(wheelX, wheelY, wheelZ),
      new THREE.Vector3(wheelX, wheelY + Math.sin(a) * 0.43, wheelZ + Math.cos(a) * 0.43),
      0.008,
      '#b9a269',
    )
    box(g, 0.07, 0.07, 0.07, i % 2 ? '#c94f42' : '#3c6f70', wheelX, wheelY + Math.sin(a) * 0.43, wheelZ + Math.cos(a) * 0.43)
  }
  box(g, 0.04, 1.2, 0.04, '#9d8b63', wheelX, 0.6, wheelZ)
}

function fortDenison(g: THREE.Group) {
  cyl(g, 0.56, 0.3, '#8d8674', 0, -0.15, 0, 0.48, 18)
  cyl(g, 0.45, 0.18, '#6c7860', 0, 0.04, 0, 0.42, 18)
  box(g, 0.34, 0.16, 0.34, '#b6a887', 0, 0.28, 0)
  cyl(g, 0.3, 0.7, '#b8a582', 0, 0.65, 0, 0.27, 16)
  cyl(g, 0.34, 0.1, '#cbb894', 0, 1.02, 0, 0.34, 16)
  cyl(g, 0.18, 0.28, '#d8d3c1', 0.2, 1.16, 0.12, 0.12, 10)
  cyl(g, 0.12, 0.22, '#f0e8ce', 0.2, 1.38, 0.12, 0.08, 10)
  box(g, 0.04, 0.18, 0.04, '#6c7860', 0.2, 1.56, 0.12)
  box(g, 0.1, 0.18, 0.02, '#313d3a', 0, 0.62, 0.3)
}

function observatory(g: THREE.Group) {
  cyl(g, 0.6, 0.3, '#7d8d63', 0, 0.15, 0, 0.55, 18)
  cyl(g, 0.48, 0.12, '#9aa77b', 0, 0.34, 0, 0.45, 18)
  box(g, 0.66, 0.42, 0.5, '#c5a97b', 0, 0.58, 0)
  box(g, 0.7, 0.06, 0.54, '#dcc79f', 0, 0.8, 0)
  box(g, 0.12, 0.2, 0.02, '#5e4f3f', 0, 0.56, 0.26)
  cyl(g, 0.2, 0.2, '#b7a47f', 0.08, 0.92, -0.04, 0.22, 12)
  dome(g, 0.24, '#6d8f86', 0.08, 1.0, -0.04, 1, 0.7, 1)
  box(g, 0.03, 0.035, 0.24, '#4c5654', 0.08, 1.16, -0.04)
  box(g, 0.04, 1.0, 0.04, '#9b8a6b', -0.24, 1.28, 0.02)
  box(g, 0.34, 0.03, 0.03, '#9b8a6b', -0.4, 1.72, 0.02)
  box(g, 0.03, 0.3, 0.03, '#c9b98f', -0.55, 1.56, 0.02)
}

const BUILDERS: Record<string, (g: THREE.Group) => void> = {
  'opera-house': operaHouse,
  'harbour-bridge': harbourBridge,
  'sydney-tower': sydneyTower,
  qvb,
  'st-marys': stMarys,
  'luna-park': lunaPark,
  'fort-denison': fortDenison,
  observatory,
}

export function buildLandmark(site: LandmarkSite): THREE.Group {
  const source = new THREE.Group()
  source.name = site.id
  BUILDERS[site.id](source)
  source.updateMatrixWorld(true)
  // Merge by material so each landmark stays a handful of draw calls.
  const byMaterial = new Map<THREE.Material, THREE.BufferGeometry[]>()
  source.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return
    o.updateMatrix()
    const g = o.geometry.clone()
    g.applyMatrix4(o.matrix)
    const flat = g.index ? g.toNonIndexed() : g
    byMaterial.set(o.material as THREE.Material, [...(byMaterial.get(o.material as THREE.Material) ?? []), flat])
  })
  const g = new THREE.Group()
  g.name = site.id
  byMaterial.forEach((geometries, material) => {
    const merged = mergeGeometries(geometries, false)
    if (!merged) return
    const m = new THREE.Mesh(merged, material)
    m.castShadow = true
    m.receiveShadow = true
    g.add(m)
  })
  if (site.id === 'opera-house') g.scale.setScalar(1.18)
  g.position.set(site.x, LAND_Y, site.z)
  return g
}

export function landmarkBounds(site: LandmarkSite): THREE.Box3 {
  const g = buildLandmark(site)
  return new THREE.Box3().setFromObject(g)
}

export function buildAllLandmarks(): THREE.Group[] {
  return LANDMARKS.map(buildLandmark)
}

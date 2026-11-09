import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { Point } from './geo'

export type Kind =
  | 'stone'
  | 'brick'
  | 'glass'
  | 'metal'
  | 'roof'
  | 'window'
  | 'windowCool'
  | 'green'
  | 'accent'

type Entry = { matrix: THREE.Matrix4; color: THREE.Color }

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

/**
 * Instanced primitive kit. Ordinary buildings are authored as boxes and a handful of cylinders;
 * the whole fabric becomes one draw call per material kind.
 */
export class Kit {
  private boxes = new Map<Kind, Entry[]>()
  private custom = new Map<Kind, THREE.BufferGeometry[]>()
  private object = new THREE.Object3D()
  private origin = new THREE.Vector3()
  private yaw = 0
  readonly counts: Record<string, number> = {}
  readonly materials: Record<Kind, THREE.MeshStandardMaterial> = {
    stone: new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0.02 }),
    brick: new THREE.MeshStandardMaterial({ roughness: 0.92, metalness: 0.01 }),
    glass: new THREE.MeshStandardMaterial({ roughness: 0.24, metalness: 0.42, side: THREE.DoubleSide }),
    metal: new THREE.MeshStandardMaterial({ roughness: 0.38, metalness: 0.62 }),
    roof: new THREE.MeshStandardMaterial({ roughness: 0.82, metalness: 0.05 }),
    window: new THREE.MeshStandardMaterial({
      roughness: 0.26,
      metalness: 0.24,
      emissive: new THREE.Color('#ffae55'),
      emissiveIntensity: 0,
    }),
    windowCool: new THREE.MeshStandardMaterial({
      roughness: 0.2,
      metalness: 0.34,
      emissive: new THREE.Color('#9ed0e8'),
      emissiveIntensity: 0,
    }),
    green: new THREE.MeshStandardMaterial({ roughness: 0.72, metalness: 0.08 }),
    accent: new THREE.MeshStandardMaterial({
      roughness: 0.4,
      metalness: 0.45,
      emissive: new THREE.Color('#e8b45a'),
      emissiveIntensity: 0,
    }),
  }
  private customMaterials: Partial<Record<Kind, THREE.MeshStandardMaterial>> = {}
  private meshes: THREE.Object3D[] = []

  constructor(private scene: THREE.Scene) {}

  at(x: number, z: number, y: number, yaw = 0) {
    this.origin.set(x, y, z)
    this.yaw = yaw
    return this
  }

  private matrix(x: number, y: number, z: number, sx: number, sy: number, sz: number, rotation = 0) {
    this.object.position.set(x, y, z).applyAxisAngle(THREE.Object3D.DEFAULT_UP, this.yaw).add(this.origin)
    this.object.rotation.set(0, this.yaw + rotation, 0)
    this.object.scale.set(sx, sy, sz)
    this.object.updateMatrix()
    return this.object.matrix.clone()
  }

  box(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: string,
    kind: Kind = 'stone',
    yaw = 0,
  ) {
    if (w <= 0 || h <= 0 || d <= 0) return
    if (!this.boxes.has(kind)) this.boxes.set(kind, [])
    this.boxes.get(kind)!.push({ matrix: this.matrix(x, y, z, w, h, d, yaw), color: new THREE.Color(color) })
  }

  private geometry(g: THREE.BufferGeometry, color: string, kind: Kind) {
    const col = new THREE.Color(color)
    const count = g.getAttribute('position').count
    const array = new Float32Array(count * 3)
    for (let i = 0; i < array.length; i += 3) {
      array[i] = col.r
      array[i + 1] = col.g
      array[i + 2] = col.b
    }
    g.setAttribute('color', new THREE.BufferAttribute(array, 3))
    if (!g.getAttribute('uv')) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * 2), 2))
    let out = g.index ? g.toNonIndexed() : g
    if (out !== g) g.dispose()
    if (!this.custom.has(kind)) this.custom.set(kind, [])
    this.custom.get(kind)!.push(out)
  }

  cylinder(
    x: number,
    y: number,
    z: number,
    r: number,
    h: number,
    color: string,
    kind: Kind = 'stone',
    top = r,
    sides = 10,
  ) {
    const g = new THREE.CylinderGeometry(top, r, h, sides)
    g.applyMatrix4(this.matrix(x, y, z, 1, 1, 1))
    this.geometry(g, color, kind)
  }

  cone(x: number, y: number, z: number, r: number, h: number, color: string, kind: Kind = 'roof', sides = 4) {
    this.cylinder(x, y, z, r, h, color, kind, 0.001, sides)
  }

  beam(a: THREE.Vector3, b: THREE.Vector3, r: number, color: string, kind: Kind = 'metal') {
    const v = b.clone().sub(a)
    if (v.length() < 1e-5) return
    const g = new THREE.CylinderGeometry(r, r, v.length(), 5)
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize()))
    const mid = a.clone().add(b).multiplyScalar(0.5)
    g.applyMatrix4(this.matrix(mid.x, mid.y, mid.z, 1, 1, 1))
    this.geometry(g, color, kind)
  }

  /** Window strips on the four faces of a box footprint. */
  windows(x: number, y: number, z: number, w: number, h: number, d: number, color: string, kind: Kind = 'window') {
    const t = 0.018
    for (const [sx, sz, ww, dd] of [
      [0, d / 2 + t, w * 0.78, t],
      [0, -d / 2 - t, w * 0.78, t],
      [w / 2 + t, 0, t, d * 0.78],
      [-w / 2 - t, 0, t, d * 0.78],
    ] as const) {
      this.box(x + sx, y, z + sz, ww, h, dd, color, kind)
    }
  }

  count(name: string) {
    this.counts[name] = (this.counts[name] ?? 0) + 1
  }

  finish() {
    for (const [kind, entries] of this.boxes) {
      const mesh = new THREE.InstancedMesh(boxGeometry, this.materials[kind], entries.length)
      entries.forEach((entry, i) => {
        mesh.setMatrixAt(i, entry.matrix)
        mesh.setColorAt(i, entry.color)
      })
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      mesh.castShadow = kind !== 'window' && kind !== 'windowCool'
      mesh.receiveShadow = true
      mesh.frustumCulled = false
      this.scene.add(mesh)
      this.meshes.push(mesh)
    }
    for (const [kind, geometries] of this.custom) {
      const merged = mergeGeometries(geometries, false)
      if (!merged) continue
      const material =
        this.customMaterials[kind] ??
        (this.customMaterials[kind] = new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.7,
          metalness: kind === 'glass' ? 0.35 : 0.12,
          emissive: kind === 'window' ? new THREE.Color('#ffae55') : new THREE.Color('#000000'),
          emissiveIntensity: 0,
        }))
      const mesh = new THREE.Mesh(merged, material)
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.frustumCulled = false
      this.scene.add(mesh)
      this.meshes.push(mesh)
      geometries.forEach((g) => g.dispose())
    }
  }

  update(night: number) {
    this.materials.window.emissiveIntensity = 4.5 * night
    this.materials.windowCool.emissiveIntensity = 2.4 * night
    this.materials.accent.emissiveIntensity = 1.2 * night
    const custom = this.customMaterials.window
    if (custom) custom.emissiveIntensity = 4.5 * night
  }

  dispose() {
    this.meshes.forEach((m) => {
      if (m instanceof THREE.Mesh) m.geometry.dispose()
    })
    for (const m of Object.values(this.materials)) m.dispose()
    for (const m of Object.values(this.customMaterials)) m?.dispose()
  }
}

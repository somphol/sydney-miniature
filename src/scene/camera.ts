import * as THREE from 'three'

export type CameraGuard = (previous: THREE.Vector3, current: THREE.Vector3) => boolean

/** Lift the camera out of any building envelope after a manual orbit. */
export function createCameraGuard(blockers: THREE.Box3[]): CameraGuard {
  return (_previous, current) => {
    let moved = false
    for (const box of blockers) {
      if (!box.containsPoint(current)) continue
      current.y = Math.max(current.y, box.max.y + 0.35)
      moved = true
    }
    return moved
  }
}

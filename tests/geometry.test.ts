import { strict as assert } from 'node:assert'
import * as THREE from 'three'
import { FAMILIES, buildBuilding } from '../src/scene/buildings'
import { LANDMARKS, LAND_Y } from '../src/scene/geo'
import { LANDMARK_ENVELOPES, buildLandmark } from '../src/scene/landmarks'
import { Kit } from '../src/scene/kit'

assert.equal(FAMILIES.length, 9, 'nine ordinary families')
const signatures = new Set<string>()
for (const family of FAMILIES) {
  const scene = new THREE.Scene()
  const kit = new Kit(scene)
  kit.at(0, 0, LAND_Y, 0)
  buildBuilding(kit, family, 0.6, 0.5, 1.2, 1)
  kit.finish()
  const boxes = scene.children.filter((o) => o instanceof THREE.InstancedMesh) as THREE.InstancedMesh[]
  const total = boxes.reduce((n, m) => n + m.count, 0)
  assert.ok(total > 0, `${family} must produce geometry`)
  const box = new THREE.Box3().setFromObject(scene)
  assert.ok(Number.isFinite(box.min.x) && Number.isFinite(box.max.y), `${family} geometry must be finite`)
  signatures.add(`${total}|${(box.max.y - box.min.y).toFixed(3)}|${(box.max.x - box.min.x).toFixed(3)}`)
  kit.dispose()
  boxes.forEach((m) => m.geometry.dispose())
}
assert.ok(signatures.size >= 6, 'ordinary families must have distinct silhouettes')

for (const site of LANDMARKS) {
  const envelope = LANDMARK_ENVELOPES[site.id]
  assert.ok(envelope, `${site.id} must have an envelope`)
  const group = buildLandmark(site)
  const box = new THREE.Box3().setFromObject(group)
  assert.ok(Number.isFinite(box.min.x) && Number.isFinite(box.max.y) && Number.isFinite(box.max.z), `${site.id} geometry must be finite`)
  const floor = site.id === 'fort-denison' ? 0.18 : LAND_Y - 0.12
  assert.ok(box.min.y >= floor, `${site.id} must not sink below the land`)
  assert.ok(box.max.y <= LAND_Y + envelope.maxY + 0.03, `${site.id} exceeds its height envelope`)
  const w = box.max.x - box.min.x
  const d = box.max.z - box.min.z
  assert.ok(w <= envelope.w + 0.12, `${site.id} is too wide: ${w.toFixed(2)} > ${envelope.w}`)
  assert.ok(d <= envelope.d + 0.12, `${site.id} is too deep: ${d.toFixed(2)} > ${envelope.d}`)
  assert.ok(w > 0.1 && d > 0.1, `${site.id} must have a real footprint`)
  assert.ok(group.children.length <= 14, `${site.id} must stay a handful of draw calls`)
}

console.log(`geometry ok: ${FAMILIES.length} families, ${LANDMARKS.length} landmarks`)

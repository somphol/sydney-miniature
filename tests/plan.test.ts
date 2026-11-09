import { strict as assert } from 'node:assert'
import { planCity } from '../src/scene/plan'
import { INSIDE_TOLERANCE, insideLand, landAt, parkAt, rectCorners, reservedAt } from './helpers'

const plan = planCity()

assert.equal(plan.components, 1, 'the road graph must be one connected component')
assert.ok(plan.edges.length > 300, `expected >300 road edges, got ${plan.edges.length}`)
assert.ok(plan.parcels.length >= 180, `expected >=180 parcels, got ${plan.parcels.length}`)
assert.ok(plan.routes.length >= 20, `expected >=20 routes, got ${plan.routes.length}`)
assert.ok(plan.bridges.length >= 1, 'at least the Harbour Bridge must exist')

for (const bridge of plan.bridges) {
  assert.ok(insideLand(bridge.start[0], bridge.start[1]), `${bridge.id} must start on land`)
  assert.ok(insideLand(bridge.end[0], bridge.end[1]), `${bridge.id} must end on land`)
  assert.equal(landAt(bridge.mid[0], bridge.mid[1]), null, `${bridge.id} must cross water at its midpoint`)
}

const envelope: { x: number; z: number; w: number; d: number }[] = []
for (const parcel of plan.parcels) {
  const corners = rectCorners(parcel.x, parcel.z, parcel.w, parcel.d, parcel.rot)
  for (const [x, z] of corners) assert.ok(insideLand(x, z), `parcel corner (${x},${z}) must be on land`)
  assert.ok(!parkAt(parcel.x, parcel.z), 'parcels must not sit in a park')
  assert.ok(!reservedAt(parcel.x, parcel.z, 0.02), 'parcels must not sit on a reserved landmark lot')

  for (const seg of plan.roadSegments) {
    for (const [x, z] of [[parcel.x, parcel.z], ...corners]) {
      const dx = seg.b[0] - seg.a[0]
      const dz = seg.b[1] - seg.a[1]
      const len = dx * dx + dz * dz
      const t = len > 0 ? Math.max(0, Math.min(1, ((x - seg.a[0]) * dx + (z - seg.a[1]) * dz) / len)) : 0
      const d = Math.hypot(x - (seg.a[0] + dx * t), z - (seg.a[1] + dz * t))
      assert.ok(d >= seg.width / 2 - 0.005, `parcel at (${parcel.x},${parcel.z}) overlaps a road`)
    }
  }

  const c = Math.abs(Math.cos(parcel.rot))
  const s = Math.abs(Math.sin(parcel.rot))
  const ew = parcel.w * c + parcel.d * s
  const ed = parcel.w * s + parcel.d * c
  for (const other of envelope) {
    const overlapping =
      Math.abs(other.x - parcel.x) < (other.w + ew) / 2 - 0.005 &&
      Math.abs(other.z - parcel.z) < (other.d + ed) / 2 - 0.005
    assert.ok(!overlapping, `parcels at (${parcel.x},${parcel.z}) and (${other.x},${other.z}) overlap`)
  }
  envelope.push({ x: parcel.x, z: parcel.z, w: ew, d: ed })
}

for (const p of [...plan.nodes, ...plan.parcels.flatMap((q) => [[q.x, q.z] as [number, number]])]) {
  assert.ok(Number.isFinite(p[0]) && Number.isFinite(p[1]), 'plan coordinates must be finite')
  assert.ok(Math.abs(p[0]) <= 14 && Math.abs(p[1]) <= 9.5, 'plan must stay inside the tray')
}

console.log(`plan ok: ${plan.nodes.length} nodes, ${plan.edges.length} edges, ${plan.parcels.length} parcels, ${plan.routes.length} routes`)
void INSIDE_TOLERANCE

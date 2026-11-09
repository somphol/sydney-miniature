import {
  CBD_ANGLE,
  NORTH_ANGLE,
  ROCKS_ANGLE,
  TRAY,
  districtAt,
  framePoint,
  insideLand,
  reservedAt,
  rotEnvelope,
  type District,
  type Point,
} from './geo'

export type RoadClass = 'major' | 'street' | 'lane' | 'bridge' | 'foot'

export interface RoadSpec {
  id: string
  name: string
  cls: RoadClass
  width: number
  pts: Point[]
  bridge?: boolean
}

export interface Route {
  id: string
  name: string
  width: number
  bridge: boolean
  pts: Point[]
}

export interface Parcel {
  x: number
  z: number
  w: number
  d: number
  rot: number
  district: District
}

export interface GraphEdge {
  a: number
  b: number
  road: string
  width: number
  bridge: boolean
}

export interface Plan {
  nodes: Point[]
  edges: GraphEdge[]
  parcels: Parcel[]
  routes: Route[]
  roadSegments: { a: Point; b: Point; width: number }[]
  bridges: { id: string; road: string; start: Point; end: Point; mid: Point }[]
  components: number
}

const line = (pts: Point[], id: string, name: string, cls: RoadClass, bridge = false): RoadSpec => ({
  id,
  name,
  cls,
  width: cls === 'major' ? 0.18 : cls === 'street' ? 0.12 : cls === 'lane' ? 0.085 : cls === 'bridge' ? 0.16 : 0.07,
  pts,
  bridge,
})

function gridRoads(): RoadSpec[] {
  const roads: RoadSpec[] = []
  const cbd = { cx: 0.4, cz: 3.0 }
  const uNames: [number, string, RoadClass][] = [
    [-3.8, 'Sussex Street', 'major'],
    [-3.1, 'Kent Street', 'street'],
    [-2.4, 'George Street', 'major'],
    [-1.6, 'Pitt Street', 'street'],
    [-0.8, 'Castlereagh Street', 'street'],
    [0.0, 'Elizabeth Street', 'major'],
    [0.8, 'Phillip Street', 'street'],
    [1.6, 'Macquarie Street', 'major'],
    [2.4, 'College Street', 'street'],
  ]
  const vNames: [number, string, RoadClass][] = [
    [-3.2, 'King Street', 'major'],
    [-2.3, 'Hunter Street', 'street'],
    [-1.4, 'Martin Place', 'street'],
    [-0.5, 'Bathurst Street', 'street'],
    [0.4, 'Liverpool Street', 'street'],
    [1.3, 'Goulburn Street', 'major'],
    [2.2, 'Campbell Street', 'lane'],
    [3.1, 'Hay Street', 'lane'],
  ]
  uNames.forEach(([u, name, cls]) => {
    roads.push(
      line(
        [framePoint(cbd.cx, cbd.cz, CBD_ANGLE, u, -4.4), framePoint(cbd.cx, cbd.cz, CBD_ANGLE, u, 4.4)],
        `cbd-${u}`,
        name,
        cls,
      ),
    )
  })
  vNames.forEach(([v, name, cls]) => {
    roads.push(
      line(
        [framePoint(cbd.cx, cbd.cz, CBD_ANGLE, -4.0, v), framePoint(cbd.cx, cbd.cz, CBD_ANGLE, 3.6, v)],
        `cbd-${v}`,
        name,
        cls,
      ),
    )
  })

  const north = { cx: -3.4, cz: -5.6 }
  const nu: [number, string, RoadClass][] = [
    [-2.5, 'Blues Point Road', 'major'],
    [-1.7, 'Miller Street', 'street'],
    [-0.9, 'Mount Street', 'street'],
    [-0.1, 'Pacific Highway', 'major'],
    [0.7, 'Walker Street', 'street'],
    [1.5, 'Lavender Street', 'lane'],
  ]
  const nv: [number, string, RoadClass][] = [
    [-1.6, 'Alfred Street South', 'street'],
    [-0.8, 'Broughton Street', 'street'],
    [0.0, 'Kirribilli Avenue', 'street'],
    [0.8, 'Holbrook Avenue', 'lane'],
    [1.6, 'Milsons Point Road', 'lane'],
  ]
  nu.forEach(([u, name, cls]) => {
    roads.push(
      line(
        [framePoint(north.cx, north.cz, NORTH_ANGLE, u, -2.6), framePoint(north.cx, north.cz, NORTH_ANGLE, u, 2.6)],
        `north-${u}`,
        name,
        cls,
      ),
    )
  })
  nv.forEach(([v, name, cls]) => {
    roads.push(
      line(
        [framePoint(north.cx, north.cz, NORTH_ANGLE, -2.6, v), framePoint(north.cx, north.cz, NORTH_ANGLE, 2.6, v)],
        `north-${v}`,
        name,
        cls,
      ),
    )
  })

  // The Rocks: short, irregular lanes rather than a grid.
  roads.push(
    line([[-4.6, 0.2], [-3.9, 0.45], [-3.2, 0.7], [-2.5, 0.95], [-1.8, 1.05]], 'argyle', 'Argyle Street', 'street'),
    line([[-4.0, 1.25], [-3.3, 0.95], [-2.6, 0.65], [-1.9, 0.4]], 'harrington', 'Harrington Street', 'lane'),
    line([[-3.7, 1.75], [-3.0, 1.45], [-2.3, 1.15], [-1.6, 0.95]], 'cumberland', 'Cumberland Street', 'lane'),
    line([[-3.5, 0.1], [-3.1, 0.75], [-2.7, 1.4], [-2.3, 2.0]], 'essex', 'Essex Street', 'lane'),
    line([[-2.15, -1.2], [-2.05, -0.55], [-1.95, 0.1], [-1.85, 0.7]], 'george-north', 'George Street North', 'street'),
    line([[-5.6, 2.2], [-5.3, 1.4], [-5.0, 0.6], [-4.75, -0.2], [-4.5, -0.9]], 'hickson', 'Hickson Road', 'street'),
    line([[-6.2, 1.1], [-5.7, 1.35], [-5.1, 1.55], [-4.5, 1.6]], 'wharf', 'King Street Wharf', 'foot'),
    line([[-6.5, 2.55], [-5.7, 2.35], [-4.9, 2.15], [-4.1, 2.0]], 'pyrmont', 'Pyrmont Bridge Road', 'foot'),
  )

  // West: Barangaroo and the Darling Harbour edge.
  roads.push(
    line([[-9.5, 0.35], [-9.3, 1.4], [-9.1, 2.5], [-8.9, 3.6]], 'barangaroo', 'Barangaroo Avenue', 'major'),
    line([[-10.6, 2.2], [-9.9, 2.1], [-9.2, 2.0], [-8.5, 1.95]], 'waterfront', 'Waterfront Promenade', 'foot'),
    line([[-8.2, 3.2], [-7.6, 2.7], [-7.0, 2.2], [-6.4, 1.8]], 'darling', 'Darling Drive', 'street'),
  )

  // East: Woolloomooloo, the Botanic Garden and the Domain edge.
  roads.push(
    line([[2.9, -0.05], [2.75, 0.7], [2.6, 1.5], [2.45, 2.3]], 'cowper', 'Cowper Wharf Road', 'street'),
    line([[2.1, 0.55], [2.0, 1.3], [1.9, 2.1], [1.8, 2.9]], 'cathedral', 'Cathedral Street', 'lane'),
    line([[3.8, 0.15], [3.95, 1.0], [4.1, 1.9], [4.25, 2.8]], 'macleay', 'Macleay Street', 'street'),
    line([[1.7, 3.0], [2.5, 3.15], [3.3, 3.35], [4.1, 3.55]], 'bourke', 'Bourke Street', 'street'),
    line([[0.35, 2.0], [0.6, 1.2], [0.9, 0.55], [1.2, 0.1]], 'artgallery', 'Art Gallery Road', 'street'),
    line([[1.2, 1.7], [2.1, 1.5], [3.0, 1.2], [3.8, 1.4], [4.4, 2.2], [4.1, 3.1]], 'mrsmac', "Mrs Macquaries Road", 'lane'),
    line([[4.1, 3.1], [4.0, 4.0], [3.6, 4.6], [3.0, 4.9]], 'domain', 'Domain Road', 'lane'),
  )

  // Bradfield Highway ties the bridge approach into the CBD grid at Dawes Point.
  roads.push(
    line(
      [[-4.25, 2.1], [-3.6, 2.25], [-2.9, 2.4], [-2.2, 2.55], [-1.5, 2.65]],
      'bradfield',
      'Bradfield Highway',
      'major',
    ),
  )

  // Harbour Bridge: the only crossing of the harbour in this frame.
  roads.push(
    line(
      [
        [-4.25, 2.1],
        [-4.45, 1.3],
        [-4.6, 0.5],
        [-4.75, -0.25],
        [-4.9, -1.05],
        [-5.0, -1.9],
        [-5.05, -2.7],
        [-5.02, -3.5],
        [-4.9, -4.05],
        [-4.65, -4.55],
        [-4.3, -5.0],
        [-3.95, -5.45],
      ],
      'harbour-bridge',
      'Harbour Bridge',
      'bridge',
      true,
    ),
  )

  // North shore waterfront streets tie the bridge approach into the North Shore grid.
  roads.push(
    line([[-5.7, -4.35], [-5.05, -4.3], [-4.4, -4.35], [-3.75, -4.45], [-3.1, -4.65]], 'alfred', 'Alfred Street', 'street'),
    line([[-6.2, -5.05], [-5.55, -4.95], [-4.9, -4.9], [-4.3, -4.95]], 'broughton', 'Broughton Street', 'lane'),
    line([[-6.7, -5.45], [-6.05, -5.55], [-5.4, -5.7], [-4.75, -5.85], [-4.1, -6.0]], 'kirribilli', 'Kirribilli Avenue', 'street'),
  )
  return roads
}

function segIntersection(a: Point, b: Point, c: Point, d: Point): { p: Point; t: number; u: number } | null {
  const r = [b[0] - a[0], b[1] - a[1]]
  const s = [d[0] - c[0], d[1] - c[1]]
  const den = r[0] * s[1] - r[1] * s[0]
  if (Math.abs(den) < 1e-9) return null
  const q = [c[0] - a[0], c[1] - a[1]]
  const t = (q[0] * s[1] - q[1] * s[0]) / den
  const u = (q[0] * r[1] - q[1] * r[0]) / den
  if (t < -1e-6 || t > 1 + 1e-6 || u < -1e-6 || u > 1 + 1e-6) return null
  return { p: [a[0] + r[0] * t, a[1] + r[1] * t], t, u }
}

const key = (p: Point) => `${p[0].toFixed(3)},${p[1].toFixed(3)}`

function buildGraph(roads: RoadSpec[]) {
  const segments: { a: Point; b: Point; road: RoadSpec }[] = []
  roads.forEach((road) => {
    for (let i = 0; i < road.pts.length - 1; i++) {
      segments.push({ a: road.pts[i], b: road.pts[i + 1], road })
    }
  })
  const splits = segments.map(() => [0, 1])
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const hit = segIntersection(segments[i].a, segments[i].b, segments[j].a, segments[j].b)
      if (!hit) continue
      splits[i].push(hit.t)
      splits[j].push(hit.u)
    }
  }
  const nodes: Point[] = []
  const nodeIndex = new Map<string, number>()
  const addNode = (p: Point) => {
    const k = key(p)
    if (nodeIndex.has(k)) return nodeIndex.get(k)!
    const index = nodes.length
    nodes.push(p)
    nodeIndex.set(k, index)
    return index
  }
  const edges: GraphEdge[] = []
  const kept: { a: Point; b: Point; road: RoadSpec }[] = []
  segments.forEach((seg, i) => {
    const ts = [...new Set(splits[i].map((t) => Math.round(t * 1e5) / 1e5))].sort((a, b) => a - b)
    for (let k = 0; k < ts.length - 1; k++) {
      const t0 = ts[k]
      const t1 = ts[k + 1]
      if (t1 - t0 < 1e-5) continue
      const a: Point = [seg.a[0] + (seg.b[0] - seg.a[0]) * t0, seg.a[1] + (seg.b[1] - seg.a[1]) * t0]
      const b: Point = [seg.a[0] + (seg.b[0] - seg.a[0]) * t1, seg.a[1] + (seg.b[1] - seg.a[1]) * t1]
      const mid: Point = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
      if (!seg.road.bridge && !insideLand(mid[0], mid[1])) continue
      if (a[0] < TRAY.minX - 0.5 || a[0] > TRAY.maxX + 0.5 || a[1] < TRAY.minZ - 0.5 || a[1] > TRAY.maxZ + 0.5) continue
      kept.push({ a, b, road: seg.road })
      edges.push({
        a: addNode(a),
        b: addNode(b),
        road: seg.road.name,
        width: seg.road.width,
        bridge: !!seg.road.bridge,
      })
    }
  })

  // Prune short detached stubs (shore fragments, park paths that left the land).
  const adjacency = new Map<number, number[]>()
  edges.forEach((e, i) => {
    if (!adjacency.has(e.a)) adjacency.set(e.a, [])
    if (!adjacency.has(e.b)) adjacency.set(e.b, [])
    adjacency.get(e.a)!.push(i)
    adjacency.get(e.b)!.push(i)
  })
  const component = new Map<number, number>()
  let comp = 0
  for (const node of adjacency.keys()) {
    if (component.has(node)) continue
    const stack = [node]
    component.set(node, comp)
    while (stack.length) {
      const n = stack.pop()!
      for (const ei of adjacency.get(n)!) {
        const e = edges[ei]
        const other = e.a === n ? e.b : e.a
        if (!component.has(other)) {
          component.set(other, comp)
          stack.push(other)
        }
      }
    }
    comp++
  }
  const sizes = new Map<number, number>()
  component.forEach((c) => sizes.set(c, (sizes.get(c) ?? 0) + 1))
  const keep = new Set<number>()
  edges.forEach((e, i) => {
    if ((sizes.get(component.get(e.a)!) ?? 0) >= 14) keep.add(i)
  })

  const routes: Route[] = []
  const byRoad = new Map<string, { a: Point; b: Point }[]>()
  kept.forEach((s, i) => {
    if (!keep.has(i)) return
    if (!byRoad.has(s.road.id)) byRoad.set(s.road.id, [])
    byRoad.get(s.road.id)!.push({ a: s.a, b: s.b })
  })
  roads.forEach((road) => {
    const list = byRoad.get(road.id)
    if (!list?.length) return
    let current: Point[] = [list[0].a, list[0].b]
    for (let i = 1; i < list.length; i++) {
      const prev = current[current.length - 1]
      if (key(prev) === key(list[i].a)) current.push(list[i].b)
      else {
        if (current.length > 1) routes.push({ id: road.id, name: road.name, width: road.width, bridge: !!road.bridge, pts: current })
        current = [list[i].a, list[i].b]
      }
    }
    if (current.length > 1) routes.push({ id: road.id, name: road.name, width: road.width, bridge: !!road.bridge, pts: current })
  })

  const components = new Set<number>()
  edges.forEach((e, i) => {
    if (keep.has(i)) components.add(component.get(e.a)!)
  })
  const roadSegments = kept
    .filter((_, i) => keep.has(i))
    .map((s) => ({ a: s.a, b: s.b, width: s.road.width }))
  return { nodes, edges: edges.filter((_, i) => keep.has(i)), routes, roadSegments, components: components.size, kept: kept.filter((_, i) => keep.has(i)) }
}

interface Spec {
  angle: number
  minW: number
  maxW: number
  minD: number
  maxD: number
  gap: number
}

const SPECS: Record<Exclude<District, 'Royal Botanic Garden / Domain' | 'Fort Denison'>, Spec> = {
  'The Rocks / Circular Quay': { angle: ROCKS_ANGLE, minW: 0.3, maxW: 0.48, minD: 0.3, maxD: 0.44, gap: 0.03 },
  'CBD core': { angle: CBD_ANGLE, minW: 0.46, maxW: 0.72, minD: 0.42, maxD: 0.62, gap: 0.035 },
  'Barangaroo / Darling Harbour': { angle: CBD_ANGLE, minW: 0.52, maxW: 0.82, minD: 0.48, maxD: 0.68, gap: 0.04 },
  'Woolloomooloo / Potts Point': { angle: 0.1, minW: 0.4, maxW: 0.6, minD: 0.38, maxD: 0.54, gap: 0.035 },
  'Milsons Point / Kirribilli': { angle: NORTH_ANGLE, minW: 0.4, maxW: 0.6, minD: 0.38, maxD: 0.56, gap: 0.035 },
  'North Sydney': { angle: NORTH_ANGLE, minW: 0.48, maxW: 0.75, minD: 0.45, maxD: 0.65, gap: 0.04 },
}

function distToSegment(x: number, z: number, a: Point, b: Point) {
  const dx = b[0] - a[0]
  const dz = b[1] - a[1]
  const len = dx * dx + dz * dz
  const t = len > 0 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / len)) : 0
  return Math.hypot(x - (a[0] + dx * t), z - (a[1] + dz * t))
}

function makeParcels(roadSegments: { a: Point; b: Point; width: number }[]): Parcel[] {
  let seed = 7919
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  const parcels: Parcel[] = []
  const occupied: { x: number; z: number; ew: number; ed: number }[] = []
  for (const step of [0.4, 0.24]) {
    for (let x = TRAY.minX + 0.3; x <= TRAY.maxX - 0.3; x += step) {
      for (let z = TRAY.minZ + 0.3; z <= TRAY.maxZ - 0.3; z += step) {
        if (parcels.length >= 320) break
        const px = x + (rand() - 0.5) * (step * 0.4)
        const pz = z + (rand() - 0.5) * (step * 0.4)
        const district = districtAt(px, pz)
        if (step < 0.3 && district !== 'The Rocks / Circular Quay') continue
        if (district === 'Royal Botanic Garden / Domain' || district === 'Fort Denison') continue
        if (district === 'North Sydney' && rand() < 0.28) continue
      if (reservedAt(px, pz, 0.08)) continue
      const spec = SPECS[district]
      if (!spec) continue
      const w = spec.minW + rand() * (spec.maxW - spec.minW)
      const d = spec.minD + rand() * (spec.maxD - spec.minD)
      const rot = spec.angle + (rand() - 0.5) * 0.05
      const c = Math.cos(rot)
      const s = Math.sin(rot)
      const corners: Point[] = [
        [px + (-w / 2) * c - (-d / 2) * s, pz + (-w / 2) * s + (-d / 2) * c],
        [px + (w / 2) * c - (-d / 2) * s, pz + (w / 2) * s + (-d / 2) * c],
        [px + (w / 2) * c - (d / 2) * s, pz + (w / 2) * s + (d / 2) * c],
        [px + (-w / 2) * c - (d / 2) * s, pz + (-w / 2) * s + (d / 2) * c],
      ]
      if (corners.some(([cx, cz]) => !insideLand(cx, cz) || reservedAt(cx, cz, 0.03))) continue
      if (!insideLand(px, pz)) continue
      let clear = true
      const samples: Point[] = [
        [px, pz],
        ...corners,
        ...corners.map(([cx, cz], i) => {
          const n = corners[(i + 1) % 4]
          return [(cx + n[0]) / 2, (cz + n[1]) / 2] as Point
        }),
      ]
      for (const seg of roadSegments) {
        for (const [sx, sz] of samples) {
          if (distToSegment(sx, sz, seg.a, seg.b) < seg.width / 2 + 0.025) {
            clear = false
            break
          }
        }
        if (!clear) break
      }
      if (!clear) continue
      const [ew, ed] = rotEnvelope(w, d, rot)
      if (
        reservedAt(px, pz, Math.max(ew, ed) / 2 + 0.03) ||
        occupied.some(
          (o) => Math.abs(o.x - px) < (o.ew + ew) / 2 + spec.gap && Math.abs(o.z - pz) < (o.ed + ed) / 2 + spec.gap,
        )
      ) {
        continue
      }
      occupied.push({ x: px, z: pz, ew, ed })
      parcels.push({ x: px, z: pz, w, d, rot, district })
    }
  }
  }
  return parcels
}

export function planCity(): Plan {
  const roads = gridRoads()
  const graph = buildGraph(roads)
  const parcels = makeParcels(graph.roadSegments)
  const bridge = roads.find((r) => r.id === 'harbour-bridge')!
  const start = bridge.pts[0]
  const end = bridge.pts[bridge.pts.length - 1]
  const mid = bridge.pts[Math.floor(bridge.pts.length / 2)]
  return {
    nodes: graph.nodes,
    edges: graph.edges,
    parcels,
    routes: graph.routes,
    roadSegments: graph.roadSegments,
    bridges: [{ id: 'harbour-bridge', road: 'Harbour Bridge', start, end, mid }],
    components: graph.components,
  }
}

export type Point = [number, number]

export const TRAY = { minX: -13, maxX: 13, minZ: -8.5, maxZ: 8.5, w: 26, d: 17 }
export const WATER_Y = 0.3
export const LAND_Y = 0.5
export const ROAD_Y = 0.535
export const BASE_Y = 0.56

export const CBD_ANGLE = -0.18
export const NORTH_ANGLE = 0.16
export const ROCKS_ANGLE = 0.42

// South shore, clockwise from the south-east tray corner. The harbour is north of this line.
export const SOUTH_LAND: Point[] = [
  [13, 8.5],
  [13, 1.1],
  [10.5, 0.9],
  [8.6, 0.6],
  [7.2, 0.2],
  [6.2, -0.1],
  [5.4, -0.5],
  [4.6, -0.9],
  [4.0, -0.6],
  [3.4, -0.2],
  [2.9, -0.7],
  [2.4, -1.0],
  [1.9, -0.5],
  [1.4, 0.1],
  [0.8, 0.0],
  [0.2, -0.4],
  [-0.5, -1.0],
  [-1.0, -1.55],
  [-1.25, -2.15],
  [-1.7, -1.9],
  [-2.3, -1.4],
  [-3.0, -1.2],
  [-3.6, -1.0],
  [-4.2, -0.85],
  [-4.8, -0.55],
  [-5.3, 0.1],
  [-5.8, 0.3],
  [-6.2, 0.6],
  [-6.5, 1.5],
  [-6.8, 2.4],
  [-7.3, 2.9],
  [-7.9, 2.7],
  [-8.3, 2.0],
  [-8.5, 1.0],
  [-9.1, 0.4],
  [-9.9, 0.0],
  [-10.9, -0.2],
  [-12.0, -0.5],
  [-13, -0.7],
  [-13, 8.5],
]

// North shore, clockwise from the north-west tray corner.
export const NORTH_LAND: Point[] = [
  [-13, -8.5],
  [13, -8.5],
  [13, -6.6],
  [11, -6.3],
  [9, -6.0],
  [7.4, -5.7],
  [6.0, -5.4],
  [4.8, -5.1],
  [3.6, -4.9],
  [2.6, -4.7],
  [1.6, -4.5],
  [0.6, -4.35],
  [-0.4, -4.2],
  [-1.2, -4.4],
  [-2.0, -4.55],
  [-2.8, -4.4],
  [-3.6, -4.05],
  [-4.2, -3.85],
  [-4.8, -3.55],
  [-5.3, -3.75],
  [-5.8, -4.0],
  [-6.2, -3.6],
  [-6.8, -3.9],
  [-7.4, -4.2],
  [-8.0, -4.55],
  [-9.0, -4.85],
  [-10.0, -5.15],
  [-11.0, -5.5],
  [-12.0, -5.9],
  [-13, -6.2],
  [-13, -8.5],
]

export const ISLAND = { x: 2.7, z: -3.35, r: 0.62 }

export interface Park {
  id: string
  name: string
  kind: 'garden' | 'park' | 'reserve' | 'hill'
  points: Point[]
  treeDensity: number
}

const circle = (x: number, z: number, r: number, n = 14): Point[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    return [x + Math.cos(a) * r, z + Math.sin(a) * r] as Point
  })

export const PARKS: Park[] = [
  {
    id: 'botanic',
    name: 'Royal Botanic Garden',
    kind: 'garden',
    points: [
      [0.35, 0.55],
      [1.4, 0.15],
      [2.5, 0.15],
      [3.3, 0.5],
      [3.7, 1.2],
      [3.4, 2.2],
      [2.3, 2.8],
      [1.1, 2.7],
      [0.2, 1.8],
    ],
    treeDensity: 0.85,
  },
  {
    id: 'domain',
    name: 'The Domain',
    kind: 'park',
    points: [
      [0.4, 2.95],
      [3.5, 3.25],
      [3.9, 4.4],
      [1.0, 4.55],
      [0.3, 3.7],
    ],
    treeDensity: 0.55,
  },
  {
    id: 'hyde',
    name: 'Hyde Park',
    kind: 'park',
    points: [
      [0.2, 5.1],
      [1.7, 5.1],
      [1.75, 6.1],
      [0.15, 6.1],
    ],
    treeDensity: 0.6,
  },
  {
    id: 'observatory',
    name: 'Observatory Hill',
    kind: 'hill',
    points: circle(-3.35, 1.15, 1.65),
    treeDensity: 0.35,
  },
  {
    id: 'barangaroo',
    name: 'Barangaroo Reserve',
    kind: 'reserve',
    points: [
      [-10.9, -0.05],
      [-9.5, 0.0],
      [-8.95, 0.7],
      [-9.4, 1.45],
      [-10.6, 1.15],
      [-11.2, 0.5],
    ],
    treeDensity: 0.5,
  },
  {
    id: 'luna',
    name: 'Luna Park grounds',
    kind: 'park',
    points: [
      [-7.15, -4.35],
      [-5.75, -4.35],
      [-5.75, -5.45],
      [-7.15, -5.45],
    ],
    treeDensity: 0.15,
  },
]


export interface Plaza {
  id: string
  points: Point[]
}

export const PLAZAS: Plaza[] = [
  { id: 'opera', points: circle(-0.85, -1.45, 1.55) },
  {
    id: 'quay',
    points: [
      [-2.7, -1.15],
      [-2.0, -1.7],
      [-1.2, -1.8],
      [-0.45, -1.35],
      [-0.35, -0.7],
      [-1.2, -0.45],
      [-2.25, -0.7],
    ],
  },
  {
    id: 'dawes',
    points: [
      [-4.9, 0.25],
      [-4.05, -0.1],
      [-3.45, 0.55],
      [-3.9, 1.2],
      [-4.8, 0.95],
    ],
  },
  {
    id: 'milsons',
    points: [
      [-6.1, -3.95],
      [-5.0, -3.9],
      [-4.55, -4.5],
      [-5.25, -5.0],
      [-6.2, -4.75],
    ],
  },
  {
    id: 'barangaroo',
    points: [
      [-10.2, 0.35],
      [-9.0, 0.4],
      [-8.75, 1.2],
      [-9.6, 1.55],
      [-10.45, 1.0],
    ],
  },
  {
    id: 'finger',
    points: [
      [3.15, -0.4],
      [4.3, -0.2],
      [4.65, 0.55],
      [3.6, 0.65],
    ],
  },
]

export interface LandmarkSite {
  id: string
  name: string
  area: string
  short: string
  x: number
  z: number
  look: number
  offset: [number, number, number]
  lot: { w: number; d: number; rot: number }
  minY: number
  maxY: number
}

export const LANDMARKS: LandmarkSite[] = [
  {
    id: 'opera-house',
    name: 'Sydney Opera House',
    area: 'Bennelong Point',
    short: 'Opera House',
    x: -0.85,
    z: -1.75,
    look: 0.95,
    offset: [1.2, 2.4, -3.4],
    lot: { w: 2.3, d: 1.8, rot: 0 },
    minY: 0.5,
    maxY: 2.4,
  },
  {
    id: 'harbour-bridge',
    name: 'Sydney Harbour Bridge',
    area: 'Dawes Point to Milsons Point',
    short: 'Harbour Bridge',
    x: -5.0,
    z: -2.45,
    look: 1.55,
    offset: [4.9, 4.4, -1.4],
    lot: { w: 1.5, d: 5.2, rot: 0 },
    minY: 0.5,
    maxY: 3.3,
  },
  {
    id: 'sydney-tower',
    name: 'Sydney Tower',
    area: 'CBD core',
    short: 'Sydney Tower',
    x: 0.55,
    z: 2.5,
    look: 2.45,
    offset: [4.9, 4.7, 4.9],
    lot: { w: 0.85, d: 0.85, rot: 0 },
    minY: 0.5,
    maxY: 3.7,
  },
  {
    id: 'qvb',
    name: 'Queen Victoria Building',
    area: 'George Street',
    short: 'QVB',
    x: -1.2,
    z: 3.6,
    look: 1.05,
    offset: [2.2, 5.0, 4.4],
    lot: { w: 1.9, d: 1.1, rot: 0 },
    minY: 0.5,
    maxY: 1.8,
  },
  {
    id: 'st-marys',
    name: "St Mary's Cathedral",
    area: 'College Street',
    short: "St Mary's",
    x: 0.55,
    z: 4.5,
    look: 1.45,
    offset: [1.0, 5.6, 5.0],
    lot: { w: 1.2, d: 1.8, rot: 0 },
    minY: 0.5,
    maxY: 2.7,
  },
  {
    id: 'luna-park',
    name: 'Luna Park',
    area: 'Milsons Point',
    short: 'Luna Park',
    x: -6.4,
    z: -4.9,
    look: 0.95,
    offset: [-1.2, 2.6, 3.0],
    lot: { w: 1.5, d: 1.2, rot: 0 },
    minY: 0.5,
    maxY: 2.1,
  },
  {
    id: 'fort-denison',
    name: 'Fort Denison',
    area: 'Sydney Harbour',
    short: 'Fort Denison',
    x: 2.7,
    z: -3.35,
    look: 0.85,
    offset: [3.4, 2.7, 2.5],
    lot: { w: 1.1, d: 1.1, rot: 0 },
    minY: 0.5,
    maxY: 1.8,
  },
  {
    id: 'observatory',
    name: 'Sydney Observatory',
    area: 'Observatory Hill',
    short: 'Observatory',
    x: -3.35,
    z: 1.15,
    look: 1.25,
    offset: [-1.6, 4.0, 4.0],
    lot: { w: 1.2, d: 1.2, rot: 0 },
    minY: 0.5,
    maxY: 2.0,
  },
]

export const DISTRICTS = [
  'The Rocks / Circular Quay',
  'CBD core',
  'Barangaroo / Darling Harbour',
  'Woolloomooloo / Potts Point',
  'Royal Botanic Garden / Domain',
  'Milsons Point / Kirribilli',
  'North Sydney',
  'Fort Denison',
] as const
export type District = (typeof DISTRICTS)[number]

export function pointInPolygon(x: number, z: number, poly: Point[]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i]
    const [xj, zj] = poly[j]
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside
  }
  return inside
}

export function landAt(x: number, z: number): 'south' | 'north' | 'island' | null {
  if (Math.hypot(x - ISLAND.x, z - ISLAND.z) <= ISLAND.r) return 'island'
  if (pointInPolygon(x, z, SOUTH_LAND)) return 'south'
  if (pointInPolygon(x, z, NORTH_LAND)) return 'north'
  return null
}

export function insideLand(x: number, z: number): boolean {
  return landAt(x, z) !== null
}

export function isWater(x: number, z: number): boolean {
  return landAt(x, z) === null
}

export function parkAt(x: number, z: number): Park | null {
  return PARKS.find((p) => pointInPolygon(x, z, p.points)) ?? null
}

export function landmarkAt(x: number, z: number): LandmarkSite | null {
  return (
    LANDMARKS.find((l) => {
      const dx = Math.abs(x - l.x)
      const dz = Math.abs(z - l.z)
      return dx <= l.lot.w / 2 + 0.04 && dz <= l.lot.d / 2 + 0.04
    }) ?? null
  )
}

export function districtAt(x: number, z: number): District {
  if (Math.hypot(x - ISLAND.x, z - ISLAND.z) <= ISLAND.r + 0.4) return 'Fort Denison'
  const park = parkAt(x, z)
  if (park && (park.kind === 'garden' || park.kind === 'park' || park.kind === 'reserve')) {
    if (park.id === 'luna') return 'Milsons Point / Kirribilli'
    if (park.id === 'barangaroo') return 'Barangaroo / Darling Harbour'
  }
  if (z < -3.5) return x < -4.0 ? 'Milsons Point / Kirribilli' : 'North Sydney'
  if (x < -7.3) return 'Barangaroo / Darling Harbour'
  if (x < -1.75 && z < 2.35) return 'The Rocks / Circular Quay'
  if (x > 3.0 && z < 4.8) return 'Woolloomooloo / Potts Point'
  return 'CBD core'
}

export function reservedAt(x: number, z: number, margin = 0.1): boolean {
  if (Math.hypot(x + 0.85, z + 1.75) < 1.3) return true
  if (PLAZAS.some((p) => pointInPolygon(x, z, p.points))) return true
  const l = landmarkAt(x, z)
  if (l) return true
  const park = parkAt(x, z)
  if (park) return true
  return LANDMARKS.some(
    (site) =>
      Math.abs(x - site.x) <= site.lot.w / 2 + margin && Math.abs(z - site.z) <= site.lot.d / 2 + margin,
  )
}

/** Angular frame helpers: u is the street's east axis, v its south axis. */
export function framePoint(cx: number, cz: number, angle: number, u: number, v: number): Point {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return [cx + u * c - v * s, cz + u * s + v * c]
}

export function rectPoints(w: number, d: number): Point[] {
  return [
    [-w / 2, -d / 2],
    [w / 2, -d / 2],
    [w / 2, d / 2],
    [-w / 2, d / 2],
  ]
}

export function rectCorners(cx: number, cz: number, w: number, d: number, rot: number): Point[] {
  const c = Math.cos(rot)
  const s = Math.sin(rot)
  return rectPoints(w, d).map(([x, z]) => [cx + x * c - z * s, cz + x * s + z * c] as Point)
}

export function rotEnvelope(w: number, d: number, rot: number): [number, number] {
  const c = Math.abs(Math.cos(rot))
  const s = Math.abs(Math.sin(rot))
  return [w * c + d * s, w * s + d * c]
}

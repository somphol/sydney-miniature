import { Kit } from './kit'
import type { District } from './geo'

export type Family =
  | 'Sandstone terrace'
  | 'Federation house'
  | 'Art Deco apartment'
  | 'Concrete tower'
  | 'Glass tower'
  | 'Harbour apartment'
  | 'Wharf warehouse'
  | 'Sandstone institution'
  | 'Ferry pavilion'

export const FAMILIES: Family[] = [
  'Sandstone terrace',
  'Federation house',
  'Art Deco apartment',
  'Concrete tower',
  'Glass tower',
  'Harbour apartment',
  'Wharf warehouse',
  'Sandstone institution',
  'Ferry pavilion',
]

const SAND = ['#d8bd8f', '#cbb083', '#e0c99c', '#bfa276']
const BRICK = ['#9d5b45', '#b16b50', '#8c4f3e', '#bd7d5d']
const GLASS = ['#3f7382', '#356572', '#4a8290', '#2e5e6c']
const CREAM = '#ece0c3'
const TRIM = '#f4ecd6'
const ROOF = '#7d5f4d'

function plinth(k: Kit, w: number, d: number, color = '#cbbd9d') {
  k.box(0, 0.04, 0, w + 0.03, 0.08, d + 0.03, color)
}

function parapet(k: Kit, w: number, d: number, h: number, color = TRIM) {
  k.box(0, h, 0, w + 0.03, 0.055, d + 0.03, color)
  k.box(0, h + 0.06, 0, w + 0.01, 0.02, d + 0.01, '#b7a98c')
}

function windowBands(k: Kit, w: number, d: number, y0: number, y1: number, color = '#5e7c84', step = 0.24) {
  for (let y = y0; y < y1; y += step) {
    k.windows(0, y, 0, w * 0.88, Math.min(0.085, step * 0.42), d * 0.88, color, 'window')
  }
}

function gableRoof(k: Kit, w: number, d: number, y: number, color = ROOF, height = 0.28) {
  k.cone(0, y + height / 2, 0, Math.max(w, d) * 0.68, height, color, 'roof', 4)
  k.box(0, y + height + 0.015, 0, w * 0.16, 0.035, d * 1.02, color, 'roof')
}

function chimney(k: Kit, x: number, y: number, z: number, color = '#8c5b4a') {
  k.box(x, y + 0.2, z, 0.06, 0.28, 0.06, color, 'brick')
  k.box(x, y + 0.35, z, 0.08, 0.03, 0.08, '#c9bda5')
}

function sandstoneTerrace(k: Kit, w: number, d: number, h: number, variant: number) {
  const stone = SAND[variant % SAND.length]
  plinth(k, w, d)
  k.box(0, 0.08 + (h - 0.08) / 2, 0, w, h - 0.08, d, stone, 'stone')
  windowBands(k, w, d, 0.3, h - 0.1, '#5b747a', 0.26)
  for (let y = 0.26; y < h; y += 0.34) k.box(0, y, 0, w + 0.012, 0.022, d + 0.012, CREAM)
  k.box(0, 0.14, d / 2 + 0.012, w * 0.62, 0.2, 0.02, '#4e656b', 'window')
  k.box(0, 0.28, d / 2 + 0.045, w * 0.9, 0.05, 0.15, variant % 2 ? '#1f6b57' : '#b6483d', 'green')
  if (h > 0.85) {
    k.box(0, 0.72, d / 2 + 0.04, w * 0.88, 0.035, 0.1, CREAM, 'metal')
    for (let i = 0; i < 6; i++) k.box(-w * 0.4 + (i * w * 0.8) / 5, 0.79, d / 2 + 0.09, 0.008, 0.14, 0.008, '#5c655f', 'metal')
  }
  parapet(k, w, d, h)
  if (variant % 2 === 0) chimney(k, -w * 0.3, h, -d * 0.24)
  k.count('Sandstone terrace')
}

function federationHouse(k: Kit, w: number, d: number, h: number, variant: number) {
  const brick = BRICK[variant % BRICK.length]
  k.box(0, 0.04, 0, w + 0.03, 0.08, d + 0.03, '#b9ad94')
  k.box(0, 0.08 + (h - 0.08) / 2, 0, w, h - 0.08, d, brick, 'brick')
  windowBands(k, w, d, 0.26, h - 0.08, '#5f777c', 0.3)
  k.box(0, 0.14, d / 2 + 0.03, w * 0.8, 0.2, 0.06, '#e8dfc8')
  k.box(0, 0.3, d / 2 + 0.1, w * 0.9, 0.035, 0.18, '#e8dfc8')
  for (const x of [-w * 0.41, w * 0.41]) k.box(x, 0.19, d / 2 + 0.18, 0.03, 0.36, 0.03, '#efe6cf', 'stone')
  gableRoof(k, w, d, h, variant % 2 ? '#8a5a48' : '#6f6b60', 0.26)
  chimney(k, -w * 0.33, h + 0.2, -d * 0.2, brick)
  k.count('Federation house')
}

function artDeco(k: Kit, w: number, d: number, h: number, variant: number) {
  const stone = ['#dcc49a', '#e3cfa8', '#cdb083'][variant % 3]
  plinth(k, w, d, '#b9a985')
  k.box(0, 0.08 + (h - 0.08) / 2, 0, w, h - 0.08, d, stone, 'stone')
  windowBands(k, w, d, 0.3, h - 0.1, '#507078', 0.28)
  for (let y = 0.3; y < h; y += 0.36) k.box(0, y, 0, w + 0.02, 0.03, d + 0.02, '#efe1c3')
  k.cylinder(w / 2 - 0.05, h / 2, d / 2 - 0.05, w * 0.18, h * 0.9, stone, 'stone', w * 0.18, 10)
  k.box(0, h + 0.12, 0, w * 0.42, 0.22, d * 0.3, '#c8b086')
  k.box(0, h + 0.29, 0, 0.04, 0.3, 0.06, '#a48b63')
  k.box(0, 0.14, d / 2 + 0.02, w * 0.8, 0.18, 0.02, '#35555e', 'window')
  k.count('Art Deco apartment')
}

function concreteTower(k: Kit, w: number, d: number, h: number, variant: number) {
  const tone = variant % 2 ? '#a9a69b' : '#b4b0a3'
  plinth(k, w, d, '#9c9a90')
  k.box(0, 0.2 + (h * 0.55 - 0.2) / 2, 0, w, h * 0.55, d, '#8f8f86')
  k.box(0, 0.2 + (h * 0.55 - 0.2) / 2, 0, w * 0.94, h * 0.55, d * 0.94, tone)
  for (let y = 0.38; y < h * 0.55; y += 0.26) {
    k.box(0, y, 0, w * 0.98, 0.06, d * 0.98, '#7d8a8f', 'windowCool')
    k.box(0, y + 0.07, 0, w * 1.01, 0.025, d * 1.01, '#c2beb0')
  }
  k.box(0, h * 0.55 + (h * 0.35) / 2, 0, w * 0.72, h * 0.35, d * 0.72, tone)
  for (let y = h * 0.58; y < h * 0.9; y += 0.24) k.windows(0, y, 0, w * 0.66, 0.06, d * 0.66, '#6e858a', 'windowCool')
  k.box(0, h * 0.9 + 0.08, 0, w * 0.5, 0.16, d * 0.5, '#7c7d74')
  for (let i = 0; i < 3; i++) k.box(-w * 0.16 + i * w * 0.16, h * 0.9 + 0.2, 0, w * 0.09, 0.18, d * 0.2, '#6d6f68', 'metal')
  k.count('Concrete tower')
}

function glassTower(k: Kit, w: number, d: number, h: number, variant: number) {
  const glazing = GLASS[variant % GLASS.length]
  k.box(0, 0.08, 0, w + 0.04, 0.16, d + 0.04, '#b9b5a6')
  k.box(0, 0.16 + (h - 0.16) / 2, 0, w, h - 0.16, d, glazing, 'glass')
  for (let y = 0.32; y < h - 0.05; y += 0.2) k.box(0, y, 0, w + 0.012, 0.012, d + 0.012, '#c3d0cb', 'metal')
  for (let y = 0.48; y < h - 0.1; y += 0.64) k.windows(0, y, 0, w * 0.92, 0.05, d * 0.92, '#7ea6ae', 'windowCool')
  for (const x of [-w / 2, w / 2]) for (const z of [-d / 2, d / 2]) k.box(x, h / 2, z, 0.014, h - 0.16, 0.014, '#d3dbd4', 'metal')
  k.box(0, h * 0.88 + (h * 0.12) / 2, 0, w * 0.74, h * 0.12, d * 0.74, glazing, 'glass')
  k.box(0, h * 0.88, 0, w * 0.78, 0.05, d * 0.78, '#d4ddd6', 'metal')
  k.box(0, h + 0.05, 0, w * 0.42, 0.1, d * 0.42, '#7f8a84', 'metal')
  k.count('Glass tower')
}

function harbourApartment(k: Kit, w: number, d: number, h: number, variant: number) {
  const white = variant % 2 ? '#e9e4d6' : '#dcd8ca'
  plinth(k, w, d, '#bdb6a4')
  k.box(0, 0.08 + (h - 0.08) / 2, 0, w, h - 0.08, d, white, 'stone')
  for (let y = 0.28; y < h - 0.05; y += 0.22) {
    k.box(0, y, d / 2 + 0.08, w * 0.92, 0.045, 0.2, '#f2eee1')
    k.box(0, y + 0.06, d / 2 + 0.18, w * 0.88, 0.12, 0.018, '#6d8d96', 'glass')
    k.box(0, y, -d / 2 - 0.07, w * 0.82, 0.04, 0.14, '#f2eee1')
  }
  k.box(0, h * 0.9, 0, w * 0.86, 0.1, d * 0.86, '#c9c4b2')
  for (let i = 0; i < 3; i++) k.box(-w * 0.22 + i * w * 0.22, h * 0.95, -d * 0.2, 0.12, 0.12, 0.12, '#6f8d64', 'green')
  k.count('Harbour apartment')
}

function wharfWarehouse(k: Kit, w: number, d: number, h: number, variant: number) {
  const timber = variant % 2 ? '#5d5144' : '#6b5b4b'
  k.box(0, 0.04, 0, w + 0.04, 0.08, d + 0.04, '#8f816a')
  k.box(0, 0.08 + (h - 0.08) / 2, 0, w, h - 0.08, d, timber, 'brick')
  for (let y = 0.26; y < h; y += 0.2) k.box(0, y, 0, w + 0.012, 0.012, d + 0.012, '#8c7e68')
  for (let i = 0; i < 3; i++) {
    const x = -w * 0.28 + i * w * 0.28
    k.box(x, 0.32, d / 2 + 0.012, w * 0.17, 0.34, 0.02, '#2f3d3f', 'window')
    k.box(x, 0.5, d / 2 + 0.03, w * 0.2, 0.035, 0.05, '#b9ad8f', 'metal')
  }
  k.box(w * 0.12, h * 0.82, d / 2 + 0.05, 0.03, 0.3, 0.03, '#a99c7f', 'metal')
  gableRoof(k, w, d, h, variant % 2 ? '#5b5f58' : '#6b5a4b', 0.24)
  k.box(0, 0.14, -d / 2 - 0.05, w * 0.8, 0.22, 0.06, '#8a7b62')
  k.count('Wharf warehouse')
}

function institution(k: Kit, w: number, d: number, h: number, variant: number) {
  const stone = variant % 2 ? '#b49a73' : '#c8ae83'
  plinth(k, w, d, '#a99778')
  k.box(0, 0.08 + (h - 0.08) / 2, 0, w, h - 0.08, d, stone, 'stone')
  windowBands(k, w, d, 0.34, h - 0.1, '#4c6268', 0.3)
  k.box(0, 0.2, d / 2 + 0.02, w * 0.7, 0.28, 0.02, '#463e35', 'window')
  k.box(0, 0.36, d / 2 + 0.05, w * 0.78, 0.04, 0.12, '#e2d2ae')
  gableRoof(k, w, d, h, '#59605a', 0.3)
  k.box(w * 0.3, h * 0.62, d / 2 + 0.04, w * 0.22, h * 0.7, 0.06, stone)
  k.box(w * 0.3, h * 0.98, d / 2 + 0.03, w * 0.26, 0.06, 0.08, '#d4c19b')
  k.count('Sandstone institution')
}

function ferryPavilion(k: Kit, w: number, d: number, h: number, variant: number) {
  const cream = '#efe6cc'
  k.box(0, 0.04, 0, w, 0.08, d, '#b9ad90')
  k.box(0, 0.12, 0, w * 0.9, 0.06, d * 0.9, cream)
  for (const x of [-w * 0.36, -w * 0.12, w * 0.12, w * 0.36]) {
    k.box(x, h * 0.5, -d * 0.32, 0.035, h, 0.035, '#d8ceb3', 'stone')
    k.box(x, h * 0.5, d * 0.32, 0.035, h, 0.035, '#d8ceb3', 'stone')
  }
  k.box(0, h + 0.04, 0, w, 0.08, d, variant % 2 ? '#1f6b57' : '#3f7a68', 'green')
  k.box(0, h + 0.1, 0, w * 0.94, 0.04, d * 0.9, '#e9dfc5')
  k.box(0, h * 0.54, -d / 2 + 0.02, w * 0.5, 0.16, 0.02, '#3f6d6f', 'window')
  k.box(0, h + 0.16, 0, w * 0.36, 0.08, 0.03, '#f3ead4')
  k.count('Ferry pavilion')
}

const BUILDERS: Record<Family, (k: Kit, w: number, d: number, h: number, v: number) => void> = {
  'Sandstone terrace': sandstoneTerrace,
  'Federation house': federationHouse,
  'Art Deco apartment': artDeco,
  'Concrete tower': concreteTower,
  'Glass tower': glassTower,
  'Harbour apartment': harbourApartment,
  'Wharf warehouse': wharfWarehouse,
  'Sandstone institution': institution,
  'Ferry pavilion': ferryPavilion,
}

export function buildBuilding(k: Kit, family: Family, w: number, d: number, h: number, variant: number) {
  BUILDERS[family](k, w, d, h, variant)
}

export const FAMILY_CHOICES: Record<District, Family[]> = {
  'The Rocks / Circular Quay': ['Sandstone terrace', 'Wharf warehouse', 'Sandstone institution', 'Ferry pavilion'],
  'CBD core': ['Glass tower', 'Concrete tower', 'Sandstone institution', 'Art Deco apartment', 'Sandstone terrace'],
  'Barangaroo / Darling Harbour': ['Glass tower', 'Harbour apartment', 'Wharf warehouse'],
  'Woolloomooloo / Potts Point': ['Sandstone terrace', 'Art Deco apartment', 'Wharf warehouse', 'Harbour apartment'],
  'Royal Botanic Garden / Domain': ['Sandstone institution', 'Ferry pavilion'],
  'Milsons Point / Kirribilli': ['Federation house', 'Art Deco apartment', 'Harbour apartment', 'Ferry pavilion'],
  'North Sydney': ['Concrete tower', 'Glass tower', 'Harbour apartment'],
  'Fort Denison': ['Ferry pavilion'],
}

export function heightFor(family: Family, district: District, r: number) {
  const add = district === 'CBD core' || district === 'North Sydney' ? 0.2 : 0
  const ranges: Record<Family, [number, number]> = {
    'Sandstone terrace': [0.82, 1.3],
    'Federation house': [0.68, 1.05],
    'Art Deco apartment': [1.1, 1.75],
    'Concrete tower': [2.0, 3.3],
    'Glass tower': [2.2, 3.7],
    'Harbour apartment': [1.3, 2.35],
    'Wharf warehouse': [0.8, 1.4],
    'Sandstone institution': [1.0, 1.9],
    'Ferry pavilion': [0.52, 0.85],
  }
  const [a, b] = ranges[family]
  const h = a + r * (b - a) + add
  const scale =
    district === 'The Rocks / Circular Quay'
      ? 0.72
      : district === 'Milsons Point / Kirribilli'
        ? 0.65
        : district === 'Woolloomooloo / Potts Point'
          ? 0.88
          : 1
  const capped =
    district === 'The Rocks / Circular Quay'
      ? Math.min(h * scale, 1.3)
      : district === 'Milsons Point / Kirribilli'
        ? Math.min(h * scale, 1.4)
        : district === 'Woolloomooloo / Potts Point'
          ? Math.min(h * scale, 1.75)
          : h * scale
  return district === 'North Sydney' ? Math.min(capped, 2.9) : capped
}

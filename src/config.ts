export const VERSION = '0.1.0'
export const SLUG = 'sydney-miniature'

export const LANDMARK_IDS = [
  'opera-house',
  'harbour-bridge',
  'sydney-tower',
  'qvb',
  'st-marys',
  'luna-park',
  'fort-denison',
  'observatory',
] as const
export type LandmarkId = (typeof LANDMARK_IDS)[number]

export type QualityTier = 'high' | 'low'
export interface QualitySettings {
  pixelRatio: number
  shadowMap: number
}
export const QUALITY: Record<QualityTier, QualitySettings> = {
  high: { pixelRatio: 1.6, shadowMap: 2048 },
  low: { pixelRatio: 1, shadowMap: 1024 },
}

export function isLikelyMobile() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches || Math.min(window.innerWidth, window.innerHeight) < 600
}

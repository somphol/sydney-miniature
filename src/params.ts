export interface Params {
  embed: boolean
  capture: boolean
  quality: 'high' | 'low' | null
  view: string | null
}

export function parseParams(search: string): Params {
  const q = new URLSearchParams(search)
  const quality = q.get('quality')
  return {
    embed: q.get('embed') === '1',
    capture: q.get('capture') === '1',
    quality: quality === 'high' || quality === 'low' ? quality : null,
    view: q.get('view'),
  }
}

export const params = parseParams(typeof window === 'undefined' ? '' : window.location.search)
export const view = typeof window === 'undefined' || params.capture ? null : params.view
export const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const restricted =
  typeof window !== 'undefined' &&
  (params.embed || window.parent !== window || window.origin === 'null')

// window.__scene: inspection and control surface for verification. step/act are available in capture
// mode (?capture=1), where the city is advanced from outside at a fixed dt.
import { flushSync } from 'react-dom'
import type { CityAPI } from './scene/scene'
import { LANDMARK_IDS, SLUG, VERSION, type LandmarkId, type QualityTier } from './config'
import { params, reducedMotion } from './params'
import { t } from './i18n'

export interface Handlers {
  selectLandmark: (i: number) => void
  closeLandmark: () => void
  setNight: (value: boolean) => void
  setRotate: (value: boolean) => void
  reset: () => void
  zoom: (factor: number) => void
}

export const runtime: {
  city: CityAPI | null
  handlers: Handlers | null
  selected: LandmarkId | null
  layout: 'full' | 'compact'
  quality: QualityTier
} = { city: null, handlers: null, selected: null, layout: 'full', quality: 'high' }

const errorLog: string[] = []
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => errorLog.push(String(e.message ?? e)))
  window.addEventListener('unhandledrejection', (e) => errorLog.push(String(e.reason?.message ?? e.reason)))
}

export function inspect() {
  const city = runtime.city
  const f = city?.facts
  const s = city?.state()
  return {
    quality: runtime.quality,
    errors: errorLog.length,
    facts: {
      landmarks: LANDMARK_IDS.length,
      roadEdges: f?.roadEdges ?? 0,
      vehicles: f?.vehicles ?? 0,
      pedestrians: f?.pedestrians ?? 0,
      boats: f?.boats ?? 0,
      buildings: f?.buildings ?? 0,
      triangles: f?.triangles ?? 0,
      drawCalls: f?.drawCalls ?? 0,
      reducedMotion,
    },
    state: {
      selected: runtime.selected,
      night: s?.night ?? 0,
      targetNight: s?.targetNight ?? 0,
      rotating: s?.rotating ?? false,
      azimuth: s?.azimuth ?? 0,
      polar: s?.polar ?? 0,
      distance: s?.distance ?? 0,
      target: s?.target ?? [0, 0, 0],
      transition: s?.transition ?? false,
      cameraClear: s?.cameraClear ?? true,
      layout: runtime.layout,
      embed: params.embed,
      time: s?.time ?? 0,
    },
    titles: {
      title: t.title,
      tagline: t.tagline,
      labels: LANDMARK_IDS.map((id) => t.landmarks[id].short),
    },
  }
}

let virtualTime = 0
const act = (name: string, arg?: unknown) => {
  const h = runtime.handlers
  if (!h) return
  flushSync(() => {
    switch (name) {
      case 'landmark': {
        const index = typeof arg === 'number' ? arg : LANDMARK_IDS.indexOf(arg as LandmarkId)
        if (index >= 0) h.selectLandmark(index)
        break
      }
      case 'close':
        h.closeLandmark()
        break
      case 'night':
        h.setNight(!!arg)
        break
      case 'rotate':
        h.setRotate(!!arg)
        break
      case 'reset':
        h.reset()
        break
      case 'zoom':
        h.zoom(Number(arg))
        break
      case 'orbit':
        h.setRotate(false)
        runtime.city?.orbitBy(...(arg as [number, number]))
        break
      case 'pan':
        runtime.city?.panBy(...(arg as [number, number]))
        break
      case 'screenshot':
        runtime.city?.screenshot()
        break
      default:
        break
    }
  })
}

export function attachCity(city: CityAPI) {
  runtime.city = city
  ;(window as any).__scene = {
    ready: true,
    version: VERSION,
    slug: SLUG,
    step: (n = 1, dt = 1 / 30) => {
      for (let i = 0; i < n; i++) {
        virtualTime += dt
        city.tick(dt)
      }
    },
    act,
    inspect,
    shot: () => city.screenshot(),
    state: () => inspect().state,
    facts: () => inspect().facts,
    titles: () => inspect().titles,
  }
}

export function signalReady() {
  if (typeof window !== 'undefined' && window.parent !== window) {
    window.parent.postMessage({ type: `${SLUG}:ready`, version: VERSION }, '*')
  }
}

export function signalError() {
  if (typeof window !== 'undefined' && window.parent !== window) {
    window.parent.postMessage({ type: `${SLUG}:error`, code: 'webgl' }, '*')
  }
}

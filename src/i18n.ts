import type { LandmarkId } from './config'

export interface LandmarkCopy {
  name: string
  area: string
  text: string
  short: string
}

const landmarks: Record<LandmarkId, LandmarkCopy> = {
  'opera-house': {
    name: 'Sydney Opera House',
    area: 'Bennelong Point',
    text: 'White shell vaults on a sandstone podium, turning their backs to the city and their faces to the harbour.',
    short: 'Opera House',
  },
  'harbour-bridge': {
    name: 'Sydney Harbour Bridge',
    area: 'Dawes Point to Milsons Point',
    text: 'One steel arch, two stone pylons, eight lanes and a railway, held above the water since 1932.',
    short: 'Harbour Bridge',
  },
  'sydney-tower': {
    name: 'Sydney Tower',
    area: 'CBD core',
    text: 'A golden shaft and turret above the retail podium, still the tallest thing on the skyline.',
    short: 'Sydney Tower',
  },
  qvb: {
    name: 'Queen Victoria Building',
    area: 'George Street',
    text: 'A long Romanesque sandstone block with a copper dome, built as a market and now a shopping arcade.',
    short: 'QVB',
  },
  'st-marys': {
    name: "St Mary's Cathedral",
    area: 'College Street',
    text: 'Dark sandstone Gothic, twin spires and a rose window, facing Hyde Park across the traffic.',
    short: "St Mary's",
  },
  'luna-park': {
    name: 'Luna Park',
    area: 'Milsons Point',
    text: 'The smiling face at the ferry wharf, the ferris wheel behind it, and the harbour immediately below.',
    short: 'Luna Park',
  },
  'fort-denison': {
    name: 'Fort Denison',
    area: 'Sydney Harbour',
    text: 'A small island, a round martello tower and a lighthouse, alone in the middle of the eastern basin.',
    short: 'Fort Denison',
  },
  observatory: {
    name: 'Sydney Observatory',
    area: 'Observatory Hill',
    text: 'A sandstone hill above The Rocks, with a copper dome, a signal mast and a clear view to the bridge.',
    short: 'Observatory',
  },
}

export const t = {
  title: 'Sydney Miniature',
  tagline: 'The harbour is the city.',
  eyebrow: 'CITY MINIATURE · NEW SOUTH WALES',
  titleLine1: 'A harbour',
  titleLine2: 'cut in sandstone.',
  subtitle1: 'Eight landmarks, one drowned-valley harbour,',
  subtitle2: 'ferries in every direction.',
  explore: 'Choose a landmark to fly there.',
  loading: 'Building the harbour…',
  day: 'Day',
  night: 'Night',
  autoRotate: 'Auto-rotate',
  resetView: 'Reset view',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  screenshot: 'Snapshot',
  fullscreen: 'Fullscreen',
  closeLandmark: 'Close landmark',
  closeSnapshot: 'Close snapshot',
  landmarksLabel: 'Landmarks',
  sceneControls: 'Scene controls',
  viewTools: 'View tools',
  sceneAria: 'Interactive three-dimensional miniature of Sydney Harbour',
  homeAria: 'Return to the harbour overview',
  statusDay: 'Daylight · harbour calm',
  statusNight: 'Night · ferries running',
  coordinate: '33.8568° S   151.2153° E',
  collectible: 'Eight landmarks · one offline file',
  hint: 'Drag to orbit · scroll to zoom · right-drag to pan',
  hintTouch: 'Drag to orbit · pinch to zoom · two fingers to pan',
  snapshotTitle: 'Snapshot',
  snapshotAlt: 'Captured view of the Sydney miniature',
  downloadPng: 'Download PNG',
  fullscreenUnavailable: 'Fullscreen is unavailable in this frame.',
  webglMissing: 'WebGL 2 is unavailable. Try a current browser with hardware acceleration.',
  campaign: 'SYDNEY · HARBOUR CITY',
  landmarkLabel: 'Landmark',
  landmarks,
} as const

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { attachCity, runtime, signalError, signalReady } from './capture'
import { createCity, type CityAPI } from './scene/scene'
import { isLikelyMobile, LANDMARK_IDS, type LandmarkId, type QualityTier } from './config'
import { params, reducedMotion, restricted, view } from './params'
import { t } from './i18n'
import {
  ArrowUpRight,
  Camera,
  Compass,
  MapPin,
  Maximize,
  Minus,
  MousePointer2,
  Moon,
  Plus,
  RotateCcw,
  RotateCw,
  Sun,
  X,
} from './ui/icons'

type Layout = 'full' | 'compact'
const layoutOf = (): Layout => (window.innerWidth < 900 || window.innerHeight < 560 ? 'compact' : 'full')

export default function App() {
  const host = useRef<HTMLDivElement>(null)
  const api = useRef<CityAPI | null>(null)
  const [night, setNightState] = useState(false)
  const [rotate, setRotateState] = useState(false)
  const [ready, setReady] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [capture, setCapture] = useState<string | null>(null)
  const [layout, setLayout] = useState<Layout>(layoutOf)
  const touch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  const layoutRef = useRef(layout)
  layoutRef.current = layout

  function setNight(v: boolean) {
    setNightState(v)
    api.current?.setNight(v)
  }
  function setRotate(v: boolean) {
    setRotateState(v)
    api.current?.setRotate(v)
  }
  function selectLandmark(i: number) {
    setSelected(i)
    runtime.selected = LANDMARK_IDS[i] as LandmarkId
    setRotate(false)
    api.current?.focus(i)
  }
  function closeLandmark() {
    setSelected(null)
    runtime.selected = null
  }
  function reset() {
    closeLandmark()
    setRotate(false)
    api.current?.reset()
  }
  function zoom(factor: number) {
    api.current?.zoom(factor)
  }

  runtime.handlers = { selectLandmark, closeLandmark, setNight, setRotate, reset, zoom }

  useLayoutEffect(() => {
    const update = () => {
      const l = layoutOf()
      document.body.dataset.layout = l
      runtime.layout = l
      setLayout(l)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    if (!host.current) return
    const quality: QualityTier = params.quality ?? (isLikelyMobile() ? 'low' : 'high')
    runtime.quality = quality
    try {
      const city = createCity(host.current, {
        quality,
        reducedMotion,
        live: !params.capture,
        view,
        viewOffset: () => layoutRef.current === 'full' && !params.embed,
        onFrame: () => {
          setReady(true)
          signalReady()
        },
      })
      api.current = city
      attachCity(city)
    } catch (e) {
      setError(t.webglMissing)
      console.error(e)
      signalError()
    }
    return () => {
      api.current?.dispose()
      api.current = null
      runtime.city = null
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(id)
  }, [toast])

  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      setToast(t.fullscreenUnavailable)
    }
  }

  const compact = layout === 'compact'
  const hint = (
    <p className="hint">
      {!compact && <MousePointer2 size={13} />}
      <span>{touch ? t.hintTouch : t.hint}</span>
    </p>
  )

  return (
    <main className={(night ? 'app night' : 'app') + (selected !== null ? ' selected' : '')}>
      <div className="canvas" ref={host} aria-label={t.sceneAria} />
      {!ready && !error && (
        <div className="loading">
          <span />
          {t.loading}
        </div>
      )}
      {error && <div className="error">{error}</div>}
      {!params.embed && (
        <header>
          <a
            className="brand"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              reset()
            }}
            aria-label={t.homeAria}
          >
            <span className="brand-mark" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="brand-name">Sydney</span>
            <span className="brand-slash" aria-hidden="true">
              /
            </span>
            <span className="brand-lab">Miniature</span>
            <span className="brand-divider" />
            <span className="campaign">{t.campaign}</span>
          </a>
          <div className="header-right">
            <a className="edition" href="https://github.com/somphol/sydney-miniature" target="_blank" rel="noreferrer">
              {t.tagline}
              <ArrowUpRight size={14} />
            </a>
          </div>
        </header>
      )}
      {!params.embed && !compact && (
        <section className="intro">
          <div className="eyebrow">
            <span /> {t.eyebrow}
          </div>
          <h1>
            {t.titleLine1}
            <br />
            <em>{t.titleLine2}</em>
          </h1>
          <p>
            {t.subtitle1}
            <br />
            {t.subtitle2}
          </p>
          <div className="intro-line" />
          <span className="explore-copy">{t.explore}</span>
        </section>
      )}
      {compact && hint}
      <section className="top-controls" aria-label={t.sceneControls}>
        <div className="mode-switch">
          <button className={!night ? 'active' : ''} aria-pressed={!night} data-act="day" onClick={() => setNight(false)}>
            <Sun size={16} />
            {t.day}
          </button>
          <button className={night ? 'active' : ''} aria-pressed={night} data-act="night" onClick={() => setNight(true)}>
            <Moon size={15} />
            {t.night}
          </button>
        </div>
        <button
          className={'square ' + (rotate ? 'selected' : '')}
          aria-label={t.autoRotate}
          aria-pressed={rotate}
          title={t.autoRotate}
          data-act="rotate"
          onClick={() => setRotate(!rotate)}
        >
          <RotateCw size={17} />
        </button>
        <button className="square" title={t.resetView} aria-label={t.resetView} data-act="reset" onClick={reset}>
          <RotateCcw size={17} />
        </button>
      </section>
      <div className="location">
        <span className="live-dot" />
        <span className="status">{night ? t.statusNight : t.statusDay}</span>
        <span className="coordinate">{t.coordinate}</span>
      </div>
      <aside className="view-tools" aria-label={t.viewTools}>
        <button aria-label={t.zoomIn} title={t.zoomIn} data-act="zoom-in" onClick={() => zoom(0.8)}>
          <Plus size={18} />
        </button>
        <button aria-label={t.zoomOut} title={t.zoomOut} data-act="zoom-out" onClick={() => zoom(1.25)}>
          <Minus size={18} />
        </button>
        {!restricted && !compact && (
          <>
            <div />
            <button
              aria-label={t.screenshot}
              title={t.screenshot}
              data-act="screenshot"
              onClick={() => setCapture(api.current?.screenshot() ?? null)}
            >
              <Camera size={17} />
            </button>
            <button aria-label={t.fullscreen} title={t.fullscreen} data-act="fullscreen" onClick={fullscreen}>
              <Maximize size={17} />
            </button>
          </>
        )}
      </aside>
      {!compact && (
        <div className="compass">
          <Compass size={32} strokeWidth={1} />
          <span>N</span>
        </div>
      )}
      {selected !== null && (
        <div className="landmark-info">
          <button aria-label={t.closeLandmark} data-act="close" onClick={closeLandmark}>
            <X size={15} />
          </button>
          <span className="eyebrow">{t.landmarks[LANDMARK_IDS[selected]].area}</span>
          <h2>{t.landmarks[LANDMARK_IDS[selected]].name}</h2>
          <p>{t.landmarks[LANDMARK_IDS[selected]].text}</p>
        </div>
      )}
      <section className="landmark-bar" aria-label={t.landmarksLabel}>
        <div className="landmark-label">
          <MapPin size={15} />
          <span>{t.landmarksLabel}</span>
        </div>
        <div className="landmark-buttons">
          {LANDMARK_IDS.map((id, i) => (
            <button
              className={selected === i ? 'chosen' : ''}
              key={id}
              data-landmark={id}
              aria-pressed={selected === i}
              aria-label={t.landmarks[id].name}
              title={t.landmarks[id].name}
              onClick={() => selectLandmark(i)}
            >
              <span className="landmark-num">0{i + 1}</span>
              <span className="landmark-name">{t.landmarks[id].short}</span>
              <ArrowUpRight size={13} />
            </button>
          ))}
        </div>
      </section>
      {!compact && (
        <footer>
          {hint}
          {!params.embed && <span className="collectible">{t.collectible}</span>}
        </footer>
      )}
      {capture && (
        <div className="capture-backdrop" role="dialog" aria-modal="true" aria-label={t.snapshotTitle}>
          <div className="capture-panel">
            <button aria-label={t.closeSnapshot} onClick={() => setCapture(null)}>
              <X size={18} />
            </button>
            <img src={capture} alt={t.snapshotAlt} />
            <div>
              <span>{t.snapshotTitle}</span>
              <a href={capture} download={`sydney-${night ? 'night' : 'day'}.png`}>
                {t.downloadPng} <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </main>
  )
}

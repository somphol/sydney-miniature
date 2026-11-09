# sydney-miniature — working notes

## 1. What it is

A from-scratch Three.js miniature of Sydney Harbour: two shores, the drowned-valley basin, the CBD
and The Rocks, Barangaroo, Woolloomooloo, the Botanic Garden, Milsons Point and North Sydney; eight
landmarks, nine ordinary building families, the Harbour Bridge, ferries, light rail, a train,
day/night lighting and an English UI. It builds to one offline HTML file. It is an interpretive
diorama, not a survey map, GIS product or navigation app. See [README.md](README.md) and the design
contract in [CITY.md](CITY.md).

## 2. Commands

```sh
npm install
npm run dev                 # Vite, http://localhost:5173
npm run typecheck           # tsc --noEmit
npm run test                # plan + geometry, no browser
npm run build               # typecheck + Vite build to dist/
npm run build:single        # dist/ + notices -> dist-single/index.html
npm run verify              # deterministic browser gate (21/21)
npm run shot                # visual-review images into shots/
```

`CHROME_PATH` overrides the browser for `verify` and `shot` (default
`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`). The published copy is generated:

```sh
npm run build:single
cp dist-single/index.html docs/index.html
```

## 3. Architecture

Construction order: **geography → plan → buildings/landmarks → environment → traffic → scene → UI.**

- `src/scene/geo.ts` — `SOUTH_LAND`, `NORTH_LAND`, island, parks, plazas, districts, the landmark
  table and the shared geometry helpers.
- `src/scene/plan.ts` — authored road specs (CBD grid, Rocks lanes, North Shore grid, bridge),
  segment intersections, one connected graph, parcels and traffic routes.
- `src/scene/kit.ts` — instanced box/cylinder kit for ordinary buildings (one draw call per material).
- `src/scene/buildings.ts` — nine families, district choices and height rules.
- `src/scene/landmarks.ts` — eight models merged by material, plus `LANDMARK_ENVELOPES`.
- `src/scene/environment.ts` — tray, water, land slabs, road ribbons, parks, plazas, trees, wharves,
  lamps.
- `src/scene/traffic.ts` — 44 road vehicles, 8 boats and 64 pedestrians on authored paths.
- `src/scene/scene.ts` — renderer, camera flights, day/night, facts and the `window.__scene` API.
- `src/App.tsx`, `src/i18n.ts`, `src/style.css` — UI, copy and layouts.
- `tests/plan.test.ts`, `tests/geometry.test.ts` — invariants; `scripts/verify.mjs` — browser gate.

## 4. Decisions and constraints

- Coordinates: `x` east, `z` south, `y` up (north is `-z`). Tray 26 × 17. Water `y=0.30`, land top
  `0.50`, roads `~0.535`, buildings/landmarks base `0.50`.
- The CBD grid angle is `-0.18` rad; the North Shore grid is `+0.16`; the Rocks lanes use `+0.42`.
  These are Sydney-specific, not reference defaults.
- The Harbour Bridge is the only road crossing. Bridge roads are flagged `bridge:true` and survive
  clipping over water; both endpoints must be on land and the midpoint must be water.
- Parcel clearance samples the rectangle perimeter against every road segment. Do not loosen it to
  gain parcels without re-running `npm run test`.
- Parcel placement is seeded; no `Math.random` in scene construction. All motion runs through
  `tick(dt)`; capture mode advances virtual time.
- Landmark anchors/views/envelopes live in `geo.ts` and `landmarks.ts`; the verifier repeats the
  camera targets. Change all three together.
- Landmark material merging assumes every geometry has position/normal/uv; the `mesh()` helper adds
  missing normals and uvs.
- The single file must stay offline: no external images, fonts, fetches or storage. `docs/index.html`
  is a generated copy; regenerate it after every release.
- `shots/` is gitignored; `docs/preview-*.png` are the committed release images.

## 5. Known issues

- `npm run shot` page screenshots can time out under SwiftShader after many WebGL frames. Canvas
  captures through `window.__scene.shot()` are the reliable path; the UI compact/embed captures are
  best effort.
- Landmark flights are chosen for sightlines, but the CBD is dense: QVB, St Mary's and Observatory
  use raised views to clear neighbouring towers. A green `cameraClear` check does not prove the
  landmark is unobstructed; review `shots/` after moving a view.
- Night is intentionally stylised. Window emission and warm point lights are exaggerated for a
  miniature; it is not a physically based night render.
- The Rocks has few ordinary parcels because the peninsula is narrow and the observatory, quay and
  bridge reserve most of it. That is a deliberate reading of the place, not a missing-street bug.
- `record`/video and the pixel-diff `shoot` harness are not included. `verify` is the pass/fail gate.

## 6. Continuity

- Local project: `/Users/somphol/sydney-miniature`.
- Release file: `dist-single/index.html` (~877 KiB).
- Pages copy: `docs/index.html`; deployed URL: <https://somphol.github.io/sydney-miniature/>.
  Live-checked 2026-11-08: title, capture API, 8 landmarks, 428 road edges, 276 buildings, 0 external requests.
- Design brief: `CITY.md`; provenance: `ATTRIBUTION.md`; changes: `CHANGELOG.md`.
- No secrets, tokens or personal data belong in this repository.

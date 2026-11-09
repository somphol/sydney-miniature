# City brief: Sydney

## 1. Identity

- City / district: Sydney, New South Wales — Sydney Harbour, Circular Quay, the CBD, The Rocks,
  Barangaroo, Woolloomooloo, the Royal Botanic Garden and the North Shore at Milsons Point.
- One-line pitch: A drowned-valley harbour folds around sandstone headlands, the arch carries the
  train north, and the ferries never stop crossing.
- What makes it instantly recognisable in a 3-second overview: the deep blue harbour between two
  shores, the steel arch and stone pylons of the Harbour Bridge, the white shells on Bennelong
  Point, the harbour island with its round tower, and the green headland at Mrs Macquarie's Point.
- Languages / locales: English (`en`).
- What the city is *not*: not a straight river city, not a generic beach resort, not Melbourne's
  Hoddle Grid, not a flat waterfront. The harbour is the subject; the CBD is on one bank, the North
  Shore on the other, and the water is never out of frame.

## 2. Geography (compressed)

- Orientation: north is up (`-z`). East is `+x`. Up is `+y`.
- Water: Sydney Harbour is a drowned river valley, not a river. It occupies the middle and north of
  the tray, with a wide central basin, a western arm toward Barangaroo and Darling Harbour, a
  narrow notch at Circular Quay, Farm Cove and Woolloomooloo Bay on the east, and the heads beyond
  the frame. Fort Denison sits on its own island in the eastern basin.
- Land shape: two shorelines. The south shore is a sandstone peninsula with Bennelong Point,
  Circular Quay, Dawes Point, the Botanic Garden headland and Woolloomooloo; the north shore is a
  steeper ridge from Milsons Point and Kirribilli to North Sydney. The two are joined only by the
  Harbour Bridge in this frame.
- Green: Royal Botanic Garden, the Domain, Observatory Hill, Barangaroo Reserve, Hyde Park and the
  fig-tree edges of the Domain.
- Tray aspect and approximate dimensions: 26 × 17 units, rounded tray, viewed from the south-east.
- Why the compression reads as Sydney: the harbour is a wide, irregular drowned valley with several
  bays, not a river channel; the Opera House and the bridge sit on opposite sides of Circular Quay;
  the north shore rises immediately from the water; the Botanic Garden is a green headland, not a
  park square.

## 3. Districts

| District | Where | Character | Building families | Landmarks |
| --- | --- | --- | --- | --- |
| The Rocks / Circular Quay | north-west of the CBD, on the harbour | sandstone lanes, pubs, ferry wharves, low historic fabric | Sandstone terrace, Wharf warehouse, Sandstone institution, Ferry pavilion | Opera House, Sydney Observatory |
| CBD core | centre-south | tight tilted grid, towers over sandstone frontages, retail podiums | Glass tower, Concrete tower, Sandstone institution, Art Deco apartment | Sydney Tower, Queen Victoria Building, St Mary's Cathedral |
| Barangaroo / Darling Harbour | west | new glass towers, reserve headland, waterfront promenade | Glass tower, Harbour apartment, Wharf warehouse | — |
| Woolloomooloo / Potts Point | east | terraces, Art Deco flats, the Finger Wharf, naval edge | Sandstone terrace, Art Deco apartment, Wharf warehouse, Harbour apartment | — |
| Royal Botanic Garden / Domain | east headland | fig avenues, lawns, sandstone institutions, harbour edge | Sandstone institution, Ferry pavilion | — |
| Milsons Point / Kirribilli | north shore, under the bridge | low-rise, ferry wharves, the face and wheel of Luna Park | Federation house, Art Deco apartment, Harbour apartment | Luna Park |
| North Sydney | north ridge | office towers, wide roads, a green ridge behind | Concrete tower, Glass tower, Harbour apartment | — |
| Fort Denison | harbour island | a tiny martello tower and lighthouse on a rock | — | Fort Denison |

## 4. Landmarks (8)

| # | Landmark | District | Silhouette / must-read features | Anchor (x, z) | Lot (w × d) | Look | View offset |
| - | --- | --- | --- | --- | --- | --- | --- |
| 01 | Sydney Opera House | The Rocks / Circular Quay | white shell vaults on a sandstone podium at Bennelong Point | (-0.85, -1.75) | 2.30 × 1.80 | 0.95 | [1.2, 2.4, -3.4] |
| 02 | Sydney Harbour Bridge | The Rocks / Milsons Point | one steel arch, two stone pylons, a road deck and a rail line | (-5.00, -2.45) | 1.50 × 5.20 | 1.55 | [4.9, 4.4, -1.4] |
| 03 | Sydney Tower | CBD core | golden shaft, turret, spire and antenna above the retail podium | (0.55, 2.50) | 0.85 × 0.85 | 2.45 | [4.9, 4.7, 4.9] |
| 04 | Queen Victoria Building | CBD core | long sandstone block, central copper dome, arched shopfronts | (-1.20, 3.60) | 1.90 × 1.10 | 1.05 | [2.2, 5.0, 4.4] |
| 05 | St Mary's Cathedral | CBD core | Gothic nave, twin spires, rose window, dark sandstone | (0.55, 4.50) | 1.20 × 1.80 | 1.45 | [1.0, 5.6, 5.0] |
| 06 | Luna Park | Milsons Point / Kirribilli | the smiling face entry and the ferris wheel beside the harbour | (-6.40, -4.90) | 1.50 × 1.20 | 0.95 | [-1.2, 2.6, 3.0] |
| 07 | Fort Denison | harbour island | a round martello tower and lighthouse on a small rock | (2.70, -3.35) | 1.10 × 1.10 | 0.85 | [3.4, 2.7, 2.5] |
| 08 | Sydney Observatory | The Rocks / Circular Quay | sandstone hill, domed telescope room, signal mast | (-3.35, 1.15) | 1.20 × 1.20 | 1.25 | [-1.6, 4.0, 4.0] |

The envelope table and camera targets live in `src/scene/geo.ts` and `src/scene/landmarks.ts`, and
are repeated in `tests/geometry.test.ts` and `scripts/verify.mjs`. Change all three together.

## 5. Street pattern

- Dominant pattern: the CBD grid is a tight orthogonal grid tilted about 10° against the tray, cut
  by the harbour and by Circular Quay. The Rocks keeps an organic, irregular lane pattern west of
  the CBD. The North Shore has its own grid, rotated the other way, following the ridge.
- Major roads: George, Pitt, Castlereagh, Elizabeth, Macquarie, Phillip and Kent (north–south);
  King, Hunter, Martin Place, Bathurst, Liverpool and Goulburn (east–west); Argyle, Harrington,
  Cumberland and Essex in The Rocks; Hickson Road, Sussex Street and Barangaroo Avenue west;
  Macquarie Street, College Street, Art Gallery Road, Mrs Macquaries Road and Cowper Wharf Road
  east; Alfred Street, Broughton Street, Kirribilli Avenue, Blues Point Road, Pacific Highway and
  Miller Street north.
- Bridges / tunnels / ferries and where they cross: the Harbour Bridge is the only road crossing in
  the frame, from Dawes Point to Milsons Point; it carries the railway as well. Ferries cross from
  Circular Quay to Milsons Point, Fort Denison and the eastern wharves.
- Transit: Sydney ferries (green and yellow), light rail on George Street, double-deck trains on the
  bridge, blue-and-white buses, taxis and bicycles.
- Pedestrian routes: Circular Quay promenade, the Opera House forecourt, the Rocks lanes, the
  Barangaroo waterfront, the Botanic Garden and Domain paths, the harbour bridge footway.
- Connectivity: the bridge approach roads intersect the CBD and North Shore grids; there is one
  connected road graph after small detached stubs are pruned. Ferries are a separate water network.

## 6. Architecture

| Family | Where | Height | Materials / colours | Roof / details |
| --- | --- | --- | --- | --- |
| Sandstone terrace | The Rocks, Woolloomooloo | 0.8–1.3 | honey sandstone, cream trim | parapet or iron-lace balcony, shopfront, chimneys |
| Federation house | Milsons Point, Kirribilli | 0.7–1.1 | red-brown brick, cream render | gabled terracotta roof, verandah, chimney |
| Art Deco apartment | Potts Point, Kirribilli | 1.1–1.8 | cream and tan render | curved corner, horizontal bands, fin |
| Concrete tower | CBD, North Sydney | 2.0–3.4 | grey concrete, bronze glass | vertical ribs, rooftop plant, stepped top |
| Glass tower | CBD, Barangaroo, North Sydney | 2.2–3.8 | blue-green curtain wall, silver mullions | setback crown, roof plant, podium |
| Harbour apartment | Barangaroo, Kirribilli | 1.3–2.4 | white concrete, glass balconies | stacked balconies, roof garden |
| Wharf warehouse | The Rocks, Woolloomooloo | 0.8–1.4 | dark timber, corrugated iron | gable roof, arched openings, loading beam |
| Sandstone institution | CBD, Botanic Garden edge | 1.0–2.0 | dark and honey sandstone | gables, tower, arched windows, colonnade |
| Ferry pavilion | Circular Quay, Milsons Point | 0.5–0.9 | cream timber, green roof | wide low roof, open posts, wharf deck |

## 7. Transport and city life

- Signature vehicles: green-and-yellow Sydney ferries, red-and-white light rail trams on George
  Street, silver double-deck trains with orange doors, blue-and-white buses, yellow taxis, white
  vans and bicycles.
- Boats / water traffic: ferries, a Manly catamaran, yachts, a tug and a harbour cruise boat.
- Pedestrians and street life: commuters at Circular Quay, runners in the Botanic Garden, walkers
  on the Barangaroo promenade, visitors under the bridge, gulls on the wharves.
- Street furniture, stalls, signs, trees: ferry wharves, green harbour lamps, Moreton Bay figs,
  eucalypts, benches, bins, café awnings, wayfinding totems.
- What moves at night: ferries with lit saloons, train windows, car headlights, lamp pools, warm
  office windows, the bridge arch floodlit, the Opera House shells glowing.

## 8. Palette and light

- Day: sky `#dceaf0`, fog `#cfe0e4`, sun `#fff4d8`, water `#2c6f7d`, land `#d8c9a7`, parks `#708b5c`,
  sandstone `#d8bd8f`, accent harbour green `#1f6b57`.
- Night: sky `#081526`, window light `#ffc87a`, cool glass `#8ec6d8`, water `#173b4a`, lamps
  `#ffd79a`, bridge steel `#b9c4c8`, Opera House `#fff3dd`.
- UI: ink `#14332f`, panel `rgba(250,248,238,.82)`, accent `#1f6b57`, secondary `#c58b3f`.
- Three colours to remember: sandstone honey, harbour teal, ferry green.

## 9. Copy and locales

- Title / tagline / subtitle / eyebrow / explore line: `Sydney Miniature` / `The harbour is the
  city.` / `Eight landmarks, one drowned-valley harbour, ferries in every direction.` / `CITY
  MINIATURE · NEW SOUTH WALES` / `Choose a landmark to fly there.`
- Landmark name / area / text / short label for each: see `src/i18n.ts`. Short labels are at most
  18 characters for the compact bar.
- Tone, length limits, and the compact bar constraints: plain, observant, no boosterism. Landmark
  text 18–30 words. Short labels 8–18 characters.
- Language-specific typography risks: none beyond English line breaking; the compact bar still
  needs short labels.

## 10. Technical targets

- Tray size and camera overview: 26 × 17, camera `(12.2, 16.2, 20.8)`, target `(0.2, 0.6, -0.2)`.
- Landmark view distances and look heights: 4.8–7.0 units from the target, look heights in the
  table above.
- Triangle / draw-call / building-count budget: about 193k triangles, under 300 draw calls, 268
  parcels, 276 buildings, 8 landmarks.
- Device pixel ratio, shadow map, water subdivisions: high tier 1.6 / 2048; low tier 1.0 / 1024;
  water is a single plane, no simulation.
- Single-file build, strict CSP, no external requests, system fonts.

## 11. Verification targets

- Landmark camera targets `(x, look, z)`: see the table; the verifier repeats them exactly.
- Landmark envelopes `(w, d, minY, maxY)`: in `src/scene/landmarks.ts`; tests assert finite geometry
  inside them.
- Facts: 8 landmarks, 428 road edges, 44 vehicles, 64 pedestrians, 8 boats, 276 buildings; 21
  deterministic browser checks.
- Locale checks: English title, eight short labels, `lang="en"`, no external requests.
- Embed: 345 × 345 hides the header and intro, keeps every landmark button in the viewport.

## 12. Definition of done

- [ ] The city brief is filled and reviewed.
- [ ] No reference-city coordinates, street names, landmark ids, model files, i18n strings or test
      targets remain.
- [ ] Geography, plan, buildings, landmarks, environment, traffic and copy are all target-specific.
- [ ] The road graph is connected; parcels are contained and non-overlapping; bridges cross water.
- [ ] Every planned landmark flight, day/night, the locale and the embed pass.
- [ ] The single file works offline under the sandbox CSP.
- [ ] README, AGENTS.md, CHANGELOG and screenshots are updated.

## 13. Do-not-copy checklist

- [ ] I did not copy the reference project's `src/` files and rename them.
- [ ] I did not reuse its outline, river, grid angle, street names or parcel lattice.
- [ ] I did not reuse its landmark models, anchors, view offsets or envelopes.
- [ ] I did not reuse its building families, palette or roof kit unchanged.
- [ ] I did not reuse its i18n strings or README copy.
- [ ] I did not reuse its tests' expected targets.
- [ ] The result reads as Sydney from the overview, before reading the title.

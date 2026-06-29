# Union Gables Inn

A living, breathing Saratoga Springs address — rendered for the web.

Union Gables is a c.1901 Queen Anne Victorian bed-and-breakfast at 55 Union Avenue,
a block and a half from the race course, home to the **Libby Supper Club**. This is
its website: a single, slow-scrolling page built to feel like the property itself —
old-money Saratoga, premiere by craft rather than by claim. It states nothing it
hasn't earned. The work was developed from deep research into the real inn and a
written design brief, then expanded across several sprints.

---

## Features

- **One continuous page**, scored in movements: Hero → The Mansion (I) → In Residence
  → Recognition → Rooms (II) → Libby Supper Club (III) → The Season (IV) → The Grounds
  (V) → Gallery → From the House → Weddings (VI) → Before You Come (VII) → Reserve.
- **Thirteen named rooms**, each with a slide-in detail drawer, its own photo gallery,
  and a clean hand-off to reservation.
- **A "gilded dust" hero** built in Three.js — two breathing point fields, a chandelier
  ring, fog, cursor parallax, and a gentle scroll dolly.
- **Real photography** layered over CSS gradients, preloaded and faded in, with a
  graceful fallback if an image never arrives — plus a full gallery with a lightbox.
- **A date-aware Season line** that reads the real racing calendar — the meet runs
  mid-July to Labor Day, and the copy knows whether the gate is open.
- **Two reservation modals** (the house, and a table at Libby), each composing a real
  email so a guest's note genuinely reaches someone.
- **A restrained custom cursor** with magnetic buttons, shown only to fine-pointer
  visitors and only when motion is welcome; and an elegant load veil that lifts on entry.
- **Built for everyone**: reduced-motion awareness throughout, focus traps, skip link,
  WCAG-AA focus styling, and a code-split Three.js bundle so the page is quick before
  it is ornamental.

---

## Tech stack

- **[Vite](https://vitejs.dev/)** — dev server and build (`base: './'`, so the output
  runs from any static host or a bare file path).
- **[Three.js](https://threejs.org/)** — the hero scene, dynamically imported into its
  own chunk.
- **Vanilla JavaScript** (ES modules) — no framework, no runtime dependency beyond Three.
- **HTML + CSS** — a single hand-written page and a single stylesheet.
- **Type**: Cormorant Garamond, EB Garamond, Jost.
- **Palette**: racing green, antique gold, ivory, racing silk.
- **Node 18+**.

---

## Project structure

```
union-gables/
├── index.html              Single-page scroll; SEO meta/OG/Twitter, JSON-LD
│                           (BedAndBreakfast + Restaurant), skip link, manifest/icons,
│                           reservation + Libby modals, room-detail drawer, gallery.
├── src/
│   ├── main.js             Entry. Wires everything; defers Three.js via dynamic import,
│   │                       IntersectionObserver scroll reveals, rAF scroll-progress,
│   │                       reduced-motion-aware smooth scroll.
│   ├── scene.js            Three.js "gilded dust" hero. Reduced-motion + tab-hidden
│   │                       aware. Code-split into its own chunk.
│   ├── photos.js           Real CDN photography over CSS gradients; preload-then-fade
│   │                       with graceful fallback. Hero eager, the rest lazy (IO).
│   ├── reserve.js          Room reservation modal (mailto to stay@), focus trap, a11y.
│   ├── libby-reserve.js    Libby Supper Club reservation modal (mailto to dine@).
│   ├── room-detail.js      Slide-in room drawer with gallery; hands off to reservation.
│   ├── gallery.js          The house-in-pictures gallery + full-frame lightbox.
│   ├── season.js           Date-aware hero line driven by the real racing calendar.
│   ├── cursor.js           Restrained custom cursor (fine-pointer only, motion-safe).
│   ├── intro.js            Brief load veil that lifts after load (failsafe-removed).
│   └── styles.css          All styling — palette and type.
├── public/
│   ├── photo-manifest.json ~69 photos catalogued (Nimble + Exa) with CDN base.
│   ├── 404.html  robots.txt  sitemap.xml  site.webmanifest  icon.svg
├── DESIGN-BRIEF.md         The design intent.
├── PRD.md                  Product requirements (incl. the affluent-client voice).
├── COPY-DECK.md            The written voice, room by room.
├── vite.config.js
└── package.json
```

---

## Getting started

Requires **Node 18 or newer**.

```bash
npm install      # install dependencies (Vite + Three)
npm run dev      # start the dev server at http://localhost:5173
npm run build    # produce a static site in dist/
npm run preview  # serve the built dist/ locally to check it
```

---

## How the photography system works

The site ships **no image binaries of its own**. Photography is hotlinked from the
inn's existing CDN and composited over CSS gradients, so the page reads beautifully
even before a single photo loads.

- `public/photo-manifest.json` is the catalogue — ~69 originals collected from the live
  property (via Nimble + Exa). It records the CDN base and each filename by category.
  The CDN accepts `?w=<px>&h=<px>` for responsive variants.
- `src/photos.js` reads image URLs, **preloads** each one, and **fades** it in only once
  it has decoded. If a request never resolves, the gradient simply stays — nothing
  breaks, nothing flashes. The hero loads **eagerly**; everything else loads **lazily**
  via `IntersectionObserver`.

**To self-host the photography** (recommended for production): download the originals
listed in `photo-manifest.json` from the `cdnBase`, place them under `public/`, and
repoint the URLs in `src/photos.js`, `src/room-detail.js`, and `src/gallery.js` at the
local paths. The fallback behaviour is unchanged.

---

## Accessibility & performance

- **Reduced motion is honoured everywhere** — the hero scene, smooth scroll, custom
  cursor, intro veil, and overlays all check `prefers-reduced-motion`.
- **The hero scene is code-split** — Three.js loads through a dynamic import; the main
  bundle stays around ~20 KB so the page is interactive quickly. The scene pauses when
  the tab is hidden.
- **Images are lazy** below the fold and faded in only after decode — no layout shift.
- **Modals, the room drawer, and the lightbox trap focus**, restore it on close, and
  respond to `Escape`. Rooms open by keyboard (the name is a real control).
- **A skip link** jumps past the hero; focus styling meets **WCAG AA**.

---

## SEO & structured data

`index.html` carries descriptive meta tags, Open Graph, and Twitter Card data, plus two
**JSON-LD** blocks — a `BedAndBreakfast` for the inn and a `Restaurant` for the Libby
Supper Club. `public/` adds `robots.txt`, `sitemap.xml`, `site.webmanifest`, and a
self-contained `404.html`.

---

## Before launch

Everything below is intentional and ready to be made real. Confirm each item against
the property before the site goes live.

- [ ] **Production domain** is set everywhere it appears — the canonical link, Open
      Graph/Twitter URLs, the JSON-LD `url` fields, and `public/sitemap.xml`.
- [ ] **Exact geo coordinates** in the JSON-LD are the real ones for 55 Union Avenue.
- [ ] **Price ranges** are confirmed (rooms, and Libby's `priceRange`).
- [ ] **Check-in / check-out times** are the house's actual times.
- [ ] **Breakfast hours** and the **pet policy** in the copy are confirmed — both are
      currently marked 〈confirm〉 in `index.html` / `COPY-DECK.md`.
- [ ] **Testimonials**: none are currently shipped. Publish only real, attributable
      guest words — do not invent any.
- [ ] **Raster icons exist.** `site.webmanifest` references `icon-192.png`,
      `icon-512.png`, and an apple-touch icon; only `icon.svg` is present today.
- [ ] **Inboxes are monitored** — `stay@uniongables.com` and `dine@libbysupperclub.com`.
      The reservation forms email these directly.
- [ ] **CDN images are confirmed hotlinkable**, or the photography is **self-hosted**
      from `photo-manifest.json` (see above).

---

## Deploy

`npm run build` emits a fully static `dist/`. Because the build uses a relative base, it
runs from any static host — Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3, a plain
Nginx directory, or a local file path — with no server-side runtime. Point the host at
`dist/` and you're done.

---

## Credits

Content adapted from the real Union Gables Inn and the Libby Supper Club, Saratoga
Springs, New York. This repository is a design concept — built from research and a
written brief, in the property's own understatement.

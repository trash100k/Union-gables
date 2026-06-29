# Union Gables

A redesign of [uniongables.com](https://www.uniongables.com) — the Union Gables Inn,
a c.1901 Queen Anne Victorian mansion on Union Avenue in Saratoga Springs, NY, a block
and a half from the oldest racecourse in America.

The brief: turn a dead brochure site into a *living, breathing* one that speaks to old
money New York — a Three.js wonderland that's quietly confident rather than begging for
the booking.

## What's here

A single-page, scroll-driven site built with **Vite** and **Three.js**.

- **Gilded-dust hero** — two layered Three.js point fields drift on stacked sine
  "breaths," twinkle, and answer to cursor and scroll, with a faint chandelier ring and
  exponential fog. Sunlight in a grand parlor; fireflies over the gardens at dusk.
  (`src/scene.js`)
- **Old-money art direction** — racing-green and antique-gold palette, Cormorant
  Garamond display type over EB Garamond, gold-leaf wordmark, film grain + vignette,
  drop caps, a slow marquee, and a numbered editorial structure.
- **Living micro-interactions** — scroll reveals, animated hairline underlines, a
  solidifying nav, hover lifts on the rooms, parallax grounds.
- **Real content** — the mansion, the named rooms (Annie, Kate, Cindy), the Libby
  Supper Club's six-course prix fixe, the grounds, and the actual address and phone.

### Sections

1. Hero — `Union Gables`, the confident invitation
2. The Mansion — the Gilded-Age story, gardens, pool, breakfast
3. The Rooms — Annie, Kate, Cindy
4. Libby Supper Club — six courses, one seating
5. The Grounds — gardens, pool, porch
6. Reserve — *“The season is short. The porch is not.”*

## Run it

```bash
npm install
npm run dev      # local dev server with HMR
npm run build    # production build → dist/
npm run preview  # preview the production build
```

Requires Node 18+. The build emits a fully static `dist/` that runs on any host.

## Photography

Every real photo on the live inn site was catalogued with **Nimble** (site map +
page extraction) and **Exa** (cross-check) into [`public/photo-manifest.json`](public/photo-manifest.json)
— 69 images across exterior, rooms, dining, grounds, pool and the racetrack, plus the
brand marks, all on the inn's own CDN.

`src/photos.js` layers a curated selection straight from that CDN into the hero, the
rooms, the grounds and Libby. Each image is preloaded and only swapped in on success,
so if a host ever blocks hotlinking the hand-built gradients underneath simply remain —
nothing renders a broken image. To self-host instead, download the files in the manifest
into `public/assets/photos/` and point `CDN` in `src/photos.js` at `/assets/photos/`.

## Notes on accessibility & performance

- Honors `prefers-reduced-motion`: the scene stills, animations collapse.
- The WebGL canvas is decorative (`aria-hidden`) and fails gracefully to a green wash
  if a context can't be created.
- Pixel ratio is capped at 2 and the render loop pauses when the tab is hidden.
- Fonts load from Google Fonts with Georgia / serif fallbacks.

## Credit

Content adapted from the real Union Gables Inn, 55 Union Avenue, Saratoga Springs, NY
12866 · (518) 584-1558. This is a design concept, not the live booking site.

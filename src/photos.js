/* =========================================================================
   Real Union Gables photography, layered over the design.

   Every photo lives on the inn's own CDN (see public/photo-manifest.json,
   collected with Nimble + Exa). We preload each one and only swap it in on
   success — so if a host blocks hotlinking, the hand-built gradients and
   monograms underneath simply remain. Nothing ever shows a broken image.

   Loading strategy: the hero (LCP) loads eagerly; everything else is
   lazy-loaded via a single IntersectionObserver so each photo only starts
   preloading as it nears the viewport. Where IntersectionObserver is
   unavailable, we fall back to the previous idle/timeout pass.
   ========================================================================= */

const CDN = 'https://www.uniongables.com/files-sbbasic/ba_uniongablesinn_us/'

// Each named room -> its best CDN photograph.
const ROOMS = {
  annie:    'union-gables-inn_annie-room_02.jpg',
  kate:     'union-gables-inn_kate-room_01.jpg',
  cindy:    'union-gables-inn_cindy-room_01.jpg',
  edward:   'union-gables-inn_edward-room_01.jpg',
  bill:     'union-gables-inn_bill-room_02.jpg',
  bruce:    'union-gables-inn_bruce-room_02.jpg',
  linda:    'union-gables-inn_linda-room_02.jpg',
  tom:      'union-gables-inn_tom-room_02.jpg',
  jane:     'union-gables-inn_jane-room_04.jpg',
  jody:     'union-gables-inn_jody-room_02.jpg',
  michael:  'union-gables-michael-room_03.jpg',
  henry:    'henry_suite.jpg',
  carriage: 'ch_living_area.jpg',
}

// Section backgrounds and grounds plates.
const SECTIONS = [
  { sel: '.hero__photo',          file: 'union-gables-inn_exterior_01.jpg', w: 1600 },
  { sel: '.plate__photo',         file: 'porch.jpg',                        w: 1400 },
  { sel: '.libby',                file: 'union-gables-inn_dining_05.jpg',   w: 1600 },
  { sel: '.season__photo',        file: 'union-gables-inn_saratoga-springs-racetrack.jpg', w: 1600 },
  { sel: '.weddings__photo',      file: 'union-gables-inn_garden_01.jpg',   w: 1600 },
  { sel: '.grounds__art--garden', file: 'union-gables-inn_garden_01.jpg',   w: 900 },
  { sel: '.grounds__art--pool',   file: 'union-gables-inn_pool_02.jpg',      w: 740 },
  { sel: '.grounds__art--porch',  file: 'porch.jpg',                        w: 740 },
]

function url(file, w, h) {
  const q = []
  if (w) q.push('w=' + w)
  if (h) q.push('h=' + h)
  return CDN + file + (q.length ? '?' + q.join('&') : '')
}

// Preload, then reveal only on success; otherwise the gradient stays.
function apply(el, src) {
  if (!el || !src) return
  const img = new Image()
  img.onload = () => {
    el.style.setProperty('--photo', `url("${src}")`)
    el.classList.add('has-photo')
  }
  img.onerror = () => {}
  img.src = src
}

// Build the full list of below-the-fold targets: { el, src }.
function collectLazyTargets() {
  const targets = []

  Object.entries(ROOMS).forEach(([key, file]) => {
    const el = document.querySelector(`.room__plate[data-room="${key}"]`)
    if (el) targets.push({ el, src: url(file, 740, 900) })
  })

  // SECTIONS[0] is the hero, loaded eagerly — start at index 1.
  SECTIONS.slice(1).forEach(({ sel, file, w, h }) => {
    const el = document.querySelector(sel)
    if (el) targets.push({ el, src: url(file, w, h) })
  })

  return targets
}

export function loadPhotos() {
  if (typeof document === 'undefined') return

  // The hero is the LCP candidate — load it straight away, never lazily.
  const hero = SECTIONS[0]
  const heroEl = document.querySelector(hero.sel)
  if (heroEl) apply(heroEl, url(hero.file, hero.w, hero.h))

  const targets = collectLazyTargets()
  if (!targets.length) return

  // Preferred path: viewport-based lazy loading.
  if ('IntersectionObserver' in window) {
    const byEl = new Map(targets.map((t) => [t.el, t.src]))
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const el = entry.target
        obs.unobserve(el)
        apply(el, byEl.get(el))
        byEl.delete(el)
      })
    }, { rootMargin: '300px' })
    targets.forEach((t) => observer.observe(t.el))
    return
  }

  // Fallback: no IntersectionObserver — load once idle so it never races the hero.
  const rest = () => targets.forEach((t) => apply(t.el, t.src))
  if ('requestIdleCallback' in window) requestIdleCallback(rest, { timeout: 1500 })
  else setTimeout(rest, 200)
}

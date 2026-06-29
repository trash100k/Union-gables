/* =========================================================================
   Real Union Gables photography, layered over the design.

   Every photo lives on the inn's own CDN (see public/photo-manifest.json,
   collected with Nimble + Exa). We preload each one and only swap it in on
   success — so if a host blocks hotlinking, the hand-built gradients and
   monograms underneath simply remain. Nothing ever shows a broken image.
   ========================================================================= */

const CDN = 'https://www.uniongables.com/files-sbbasic/ba_uniongablesinn_us/'

// element selector -> { file, w, h } (w/h pick the inn's responsive variant)
const ASSIGNMENTS = [
  { sel: '.hero__photo',                    file: 'union-gables-inn_exterior_01.jpg', w: 1600 },
  { sel: '.libby',                          file: 'union-gables-inn_dining_05.jpg',   w: 1600 },
  { sel: '.room__plate[data-tone="annie"]', file: 'union-gables-inn_annie-room_02.jpg', w: 740, h: 900 },
  { sel: '.room__plate[data-tone="kate"]',  file: 'union-gables-inn_kate-room_01.jpg',  w: 740, h: 900 },
  { sel: '.room__plate[data-tone="cindy"]', file: 'union-gables-inn_cindy-room_01.jpg', w: 740, h: 900 },
  { sel: '.grounds__art--garden',           file: 'union-gables-inn_garden_01.jpg',   w: 900 },
  { sel: '.grounds__art--pool',             file: 'union-gables-inn_pool_02.jpg',      w: 740 },
  { sel: '.grounds__art--porch',            file: 'porch.jpg',                        w: 740 },
]

function url(file, w, h) {
  const q = []
  if (w) q.push('w=' + w)
  if (h) q.push('h=' + h)
  return CDN + file + (q.length ? '?' + q.join('&') : '')
}

export function loadPhotos() {
  ASSIGNMENTS.forEach(({ sel, file, w, h }) => {
    const el = document.querySelector(sel)
    if (!el) return
    const src = url(file, w, h)
    const img = new Image()
    img.onload = () => {
      el.style.setProperty('--photo', `url("${src}")`)
      el.classList.add('has-photo')
    }
    img.onerror = () => { /* keep the gradient underneath */ }
    img.src = src
  })
}

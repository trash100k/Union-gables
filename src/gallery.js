/* =========================================================================
   The house, in pictures — a quiet gallery with a full-frame lightbox.

   Thumbnails are built in JS from a single curated filename list (exterior,
   grounds, interiors — kept clear of the room-card shots shown elsewhere).
   Each tile loads a ?w=600 thumb lazily; if the CDN ever refuses one, the
   tile removes itself so a broken image never shows. Clicking a tile opens
   a ?w=1600 full frame in an overlay that shares the reserve modal's dress.
   ========================================================================= */

const CDN = 'https://www.uniongables.com/files-sbbasic/ba_uniongablesinn_us/'

const PHOTOS = [
  { file: 'union-gables-inn_exterior_01.jpg',           alt: 'The Victorian exterior of Union Gables' },
  { file: 'ug_side_angle2.jpg',                         alt: 'The house seen from the side' },
  { file: 'ug_side_angle3.jpg',                         alt: 'A further angle on the house' },
  { file: 'union-gables-inn_garden_01.jpg',             alt: 'The perennial gardens in bloom' },
  { file: 'flowers_.jpg',                               alt: 'Flowers on the grounds' },
  { file: 'side_lawn.jpg',                              alt: 'The side lawn' },
  { file: 'side_lawn2.jpg',                             alt: 'The side lawn, a second view' },
  { file: 'porch.jpg',                                  alt: 'The wraparound porch' },
  { file: 'outside_patio.jpg',                          alt: 'The outdoor patio' },
  { file: 'ug_fountain1.jpg',                           alt: 'The garden fountain' },
  { file: 'ug_fountain2.jpg',                           alt: 'The fountain, a second view' },
  { file: 'ug_sign_and_fountain.jpg',                   alt: 'The house sign beside the fountain' },
  { file: 'union-gables-inn_pool_02.jpg',               alt: 'The seasonal pool' },
  { file: 'pool2.jpg',                                  alt: 'The pool, a second view' },
  { file: 'pool3.jpg',                                  alt: 'The pool, a third view' },
  { file: 'lobby4.jpg',                                 alt: 'The front lobby' },
  { file: 'lobby5.jpg',                                 alt: 'The lobby, a second view' },
  { file: 'billiards_room.jpg',                         alt: 'The billiards room' },
  { file: 'union-gables-inn_dining_03.jpg',             alt: 'The dining room' },
  { file: 'union-gables-inn_dining_08.jpg',             alt: 'The dining room, set for supper' },
  { file: 'dining_room1.jpg',                           alt: 'A corner of the dining room' },
  { file: 'union-gables-inn_outdoor-events_01-min.jpg', alt: 'The grounds set for a gathering' },
]

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'

function url(file, w) { return CDN + file + '?w=' + w }

function el(tag, cls, attrs) {
  const node = document.createElement(tag)
  if (cls) node.className = cls
  if (attrs) for (const k in attrs) node.setAttribute(k, attrs[k])
  return node
}

export function initGallery() {
  if (typeof document === 'undefined') return
  const grid = document.querySelector('.gallery__grid')
  if (!grid) return

  const live = []

  PHOTOS.forEach((photo) => {
    const tile = el('button', 'gallery__tile', {
      type: 'button',
      'aria-label': 'Open photograph: ' + photo.alt,
    })
    const img = el('img', 'gallery__img', {
      src: url(photo.file, 600),
      alt: photo.alt,
      loading: 'lazy',
      decoding: 'async',
    })
    img.addEventListener('error', () => { tile.remove() }, { once: true })
    tile.appendChild(img)
    tile.addEventListener('click', () => open(live.indexOf(photo)))
    grid.appendChild(tile)
    live.push(photo)
  })

  const box = buildLightbox()
  document.body.appendChild(box.root)

  let lastFocus = null
  let index = 0

  function show(i) {
    const n = live.length
    if (!n) return
    index = (i + n) % n
    const photo = live[index]
    box.img.classList.remove('is-broken')
    box.img.alt = photo.alt
    box.img.src = url(photo.file, 1600)
    box.counter.textContent = (index + 1) + ' / ' + n
    const single = n < 2
    box.prev.hidden = single
    box.next.hidden = single
  }

  function open(i) {
    if (i < 0 || !live.length) return
    lastFocus = document.activeElement
    show(i)
    box.root.classList.add('is-open')
    box.root.setAttribute('aria-hidden', 'false')
    document.body.style.overflow = 'hidden'
    setTimeout(() => box.close.focus(), prefersReduced ? 0 : 60)
  }

  function close() {
    box.root.classList.remove('is-open')
    box.root.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = ''
    box.img.removeAttribute('src')
    if (lastFocus && lastFocus.focus) lastFocus.focus()
  }

  box.img.addEventListener('error', () => { box.img.classList.add('is-broken') })

  box.root.querySelectorAll('[data-close]').forEach((c) =>
    c.addEventListener('click', close),
  )
  box.prev.addEventListener('click', () => show(index - 1))
  box.next.addEventListener('click', () => show(index + 1))

  box.root.addEventListener('keydown', (e) => {
    if (!box.root.classList.contains('is-open')) return
    if (e.key === 'Escape') { e.preventDefault(); close(); return }
    if (e.key === 'ArrowRight' && live.length > 1) { e.preventDefault(); show(index + 1); return }
    if (e.key === 'ArrowLeft' && live.length > 1) { e.preventDefault(); show(index - 1); return }
    if (e.key === 'Tab') {
      const list = [...box.panel.querySelectorAll(FOCUSABLE)]
        .filter((node) => !node.hidden && node.offsetParent !== null)
      if (!list.length) return
      const first = list[0], last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  })
}

function buildLightbox() {
  const root = el('div', 'lightbox', { 'aria-hidden': 'true' })
  const scrim = el('div', 'lightbox__scrim', { 'data-close': '' })
  const panel = el('div', 'lightbox__panel', {
    role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Photographs of the house', tabindex: '-1',
  })

  const close = el('button', 'lightbox__close', { type: 'button', 'data-close': '', 'aria-label': 'Close' })
  close.innerHTML = '&times;'

  const figure = el('figure', 'lightbox__figure')
  const img = el('img', 'lightbox__img', { alt: '', decoding: 'async' })
  figure.appendChild(img)

  const nav = el('div', 'lightbox__nav')
  const prev = el('button', 'lightbox__arrow lightbox__arrow--prev', { type: 'button', 'aria-label': 'Previous photograph' })
  prev.innerHTML = '&#8592;'
  const counter = el('span', 'lightbox__counter', { 'aria-live': 'polite' })
  const next = el('button', 'lightbox__arrow lightbox__arrow--next', { type: 'button', 'aria-label': 'Next photograph' })
  next.innerHTML = '&#8594;'
  nav.append(prev, counter, next)

  panel.append(close, figure, nav)
  root.append(scrim, panel)

  return { root, panel, close, img, prev, next, counter }
}

/* =========================================================================
   Room detail — a longer look before the booking step.

   Clicking a room's plate or name opens a slide-in panel from the right:
   the name, the house's own description (read from the card so the copy
   stays single-sourced), the tag, and a wordless photo gallery. A single
   gold control — "Reserve The [Name]" — hands off to the reservation modal.
   ========================================================================= */

const CDN = 'https://www.uniongables.com/files-sbbasic/ba_uniongablesinn_us/'

const GALLERIES = {
  annie:    ['union-gables-inn_annie-room_02.jpg'],
  kate:     ['union-gables-inn_kate-room_01.jpg', 'union-gables-inn_kate-room_03.jpg', 'kate.jpg'],
  cindy:    ['union-gables-inn_cindy-room_01.jpg', 'cindy3.jpg'],
  edward:   ['union-gables-inn_edward-room_01.jpg', 'edward.jpg'],
  bill:     ['union-gables-inn_bill-room_02.jpg', 'bill_bathroom.jpg'],
  bruce:    ['union-gables-inn_bruce-room_02.jpg', 'bruce1.jpg', 'bruce2.jpg'],
  linda:    ['union-gables-inn_linda-room_02.jpg', 'linda1.jpg', 'linda2.jpg'],
  tom:      ['union-gables-inn_tom-room_02.jpg', 'tom.jpg', 'tom2.jpg'],
  jane:     ['union-gables-inn_jane-room_04.jpg'],
  jody:     ['union-gables-inn_jody-room_02.jpg'],
  michael:  ['union-gables-michael-room_03.jpg', 'michael_room.jpg'],
  henry:    ['henry_suite.jpg', 'henry_suite1.jpg', 'henry_suite2.jpg', 'henry_suite3.jpg', 'henry_suite_bathroom.jpg'],
  carriage: ['ch_living_area.jpg', 'ch_bedroom1.jpg'],
}

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'

export function initRoomDetail(onReserve) {
  const drawer = buildDrawer()
  document.body.appendChild(drawer.root)

  let lastFocus = null
  let slides = []
  let index = 0
  let currentName = ''

  function show(i) {
    if (!slides.length) return
    index = (i + slides.length) % slides.length
    slides.forEach((s, n) => s.classList.toggle('is-current', n === index))
    drawer.counter.textContent = slides.length > 1 ? `${index + 1} / ${slides.length}` : ''
    const single = slides.length < 2
    drawer.prev.hidden = single
    drawer.next.hidden = single
  }

  function open(card) {
    const key = card.querySelector('.room__plate')?.getAttribute('data-room')
    const name = card.querySelector('.room__name')?.textContent.trim() || ''
    const desc = card.querySelector('.room__desc')?.textContent.trim() || ''
    const tagEl = card.querySelector('.room__tag')
    if (!name) return

    currentName = name
    lastFocus = document.activeElement

    drawer.title.textContent = name
    drawer.desc.textContent = desc
    if (tagEl && tagEl.textContent.trim()) {
      drawer.tag.textContent = tagEl.textContent.trim()
      drawer.tag.hidden = false
    } else {
      drawer.tag.hidden = true
    }
    drawer.cta.textContent = 'Reserve ' + name
    drawer.cta.setAttribute('aria-label', 'Reserve ' + name)
    drawer.panel.setAttribute('aria-label', name)

    drawer.gallery.innerHTML = ''
    const files = GALLERIES[key] || []
    slides = files.map((file, n) => buildSlide(file, name, n))
    slides.forEach((s) => drawer.gallery.appendChild(s))
    drawer.gallery.hidden = slides.length === 0
    drawer.galleryNav.hidden = slides.length < 2
    show(0)

    drawer.root.classList.add('is-open')
    drawer.root.setAttribute('aria-hidden', 'false')
    document.body.style.overflow = 'hidden'
    setTimeout(() => drawer.close.focus(), prefersReduced ? 0 : 60)
  }

  function close() {
    drawer.root.classList.remove('is-open')
    drawer.root.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = ''
    if (lastFocus && lastFocus.focus) lastFocus.focus()
  }

  drawer.root.querySelectorAll('[data-close]').forEach((el) =>
    el.addEventListener('click', close),
  )
  drawer.prev.addEventListener('click', () => show(index - 1))
  drawer.next.addEventListener('click', () => show(index + 1))
  drawer.cta.addEventListener('click', () => {
    close()
    if (typeof onReserve === 'function') onReserve(currentName)
  })

  drawer.root.addEventListener('keydown', (e) => {
    if (!drawer.root.classList.contains('is-open')) return
    if (e.key === 'Escape') { e.preventDefault(); close(); return }
    if (e.key === 'ArrowRight' && slides.length > 1) { e.preventDefault(); show(index + 1); return }
    if (e.key === 'ArrowLeft' && slides.length > 1) { e.preventDefault(); show(index - 1); return }
    if (e.key === 'Tab') {
      const list = [...drawer.panel.querySelectorAll(FOCUSABLE)]
        .filter((el) => !el.hidden && el.offsetParent !== null)
      if (!list.length) return
      const first = list[0], last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  })

  return { open, close }
}

function el(tag, cls, attrs) {
  const node = document.createElement(tag)
  if (cls) node.className = cls
  if (attrs) for (const k in attrs) node.setAttribute(k, attrs[k])
  return node
}

function buildSlide(file, name) {
  const slide = el('figure', 'rdraw__slide')
  const img = el('img', 'rdraw__img', {
    src: CDN + file + '?w=1400',
    alt: name,
    loading: 'lazy',
    decoding: 'async',
  })
  img.addEventListener('error', () => { slide.classList.add('is-broken') }, { once: true })
  slide.appendChild(img)
  return slide
}

function buildDrawer() {
  const root = el('div', 'rdraw', { 'aria-hidden': 'true' })
  const scrim = el('div', 'rdraw__scrim', { 'data-close': '' })
  const panel = el('div', 'rdraw__panel', { role: 'dialog', 'aria-modal': 'true', tabindex: '-1' })

  const close = el('button', 'rdraw__close', { type: 'button', 'data-close': '', 'aria-label': 'Close' })
  close.innerHTML = '&times;'

  const tag = el('p', 'rdraw__tag room__tag')
  const title = el('h2', 'rdraw__title')

  const gallery = el('div', 'rdraw__gallery', { 'aria-label': 'Room photographs' })
  const galleryNav = el('div', 'rdraw__nav')
  const prev = el('button', 'rdraw__arrow rdraw__arrow--prev', { type: 'button', 'aria-label': 'Previous photograph' })
  prev.innerHTML = '&#8592;'
  const counter = el('span', 'rdraw__counter', { 'aria-hidden': 'true' })
  const next = el('button', 'rdraw__arrow rdraw__arrow--next', { type: 'button', 'aria-label': 'Next photograph' })
  next.innerHTML = '&#8594;'
  galleryNav.append(prev, counter, next)

  const desc = el('p', 'rdraw__desc')
  const cta = el('button', 'rdraw__cta btn btn--gold', { type: 'button' })

  panel.append(close, tag, title, gallery, galleryNav, desc, cta)
  root.append(scrim, panel)

  return { root, panel, close, tag, title, gallery, galleryNav, prev, next, counter, desc, cta }
}

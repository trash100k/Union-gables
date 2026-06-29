import './styles.css'
import { loadPhotos } from './photos.js'
import { initReserve } from './reserve.js'
import { initLibbyReserve } from './libby-reserve.js'
import { initSeason } from './season.js'
import { initCursor } from './cursor.js'
import { initRoomDetail } from './room-detail.js'
import { initGallery } from './gallery.js'
import { initIntro } from './intro.js'

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---- Intro veil (lifts after load; cannot ever stick) ---- */
initIntro()

/* ---- Real Union Gables photography (graceful fallback to gradients) ---- */
loadPhotos()

/* ---- Reservation flows + seasonal hero + aliveness cursor ---- */
const reserve = initReserve()
initLibbyReserve()
initSeason()
initCursor()

/* ---- A room is a way in: plate/name opens the detail drawer; the hint reserves ---- */
const roomDetail = initRoomDetail((name) => reserve && reserve.open(name))
document.querySelectorAll('.room').forEach((room) => {
  const name = room.querySelector('.room__name')?.textContent.trim()
  if (!name) return
  const hint = document.createElement('button')
  hint.type = 'button'
  hint.className = 'room__reserve'
  hint.textContent = 'Reserve ' + name + ' →'
  room.appendChild(hint)
  hint.addEventListener('click', () => reserve && reserve.open(name))
  const openDetail = () => roomDetail.open(room)
  room.querySelector('.room__plate')?.addEventListener('click', openDetail)
  // The room name is the keyboard-operable way into the detail drawer.
  const nameEl = room.querySelector('.room__name')
  if (nameEl) {
    nameEl.setAttribute('role', 'button')
    nameEl.setAttribute('tabindex', '0')
    nameEl.setAttribute('aria-haspopup', 'dialog')
    nameEl.addEventListener('click', openDetail)
    nameEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail() }
    })
  }
})

/* ---- The Gallery + lightbox ---- */
initGallery()

/* ---- Three.js hero — deferred off the critical path (decorative) ---- */
const canvas = document.getElementById('gilded-canvas')
if (canvas) {
  const startScene = () => {
    import('./scene.js')
      .then(({ initScene }) => initScene(canvas))
      .catch((err) => {
        console.warn('Gilded scene unavailable; resting on the green.', err)
        canvas.style.display = 'none'
        document.body.style.background =
          'radial-gradient(120% 90% at 50% 0%, #14301f, #0a1a12)'
      })
  }
  if ('requestIdleCallback' in window) requestIdleCallback(startScene, { timeout: 2000 })
  else setTimeout(startScene, 1)
}

/* ---- Nav: solidify on scroll ---- */
const nav = document.getElementById('nav')
if (nav) {
  const onNavScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40)
  onNavScroll()
  window.addEventListener('scroll', onNavScroll, { passive: true })
}

/* ---- Scroll reveals ---- */
const reveals = document.querySelectorAll('.reveal')
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
  )
  reveals.forEach((el) => io.observe(el))
} else {
  reveals.forEach((el) => el.classList.add('is-visible'))
}

/* ---- Smooth anchor scrolling (reserve triggers excepted, reduced-motion aware) ---- */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  if (link.hasAttribute('data-reserve')) return
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href')
    if (id.length < 2) return
    const target = document.querySelector(id)
    if (!target) return
    e.preventDefault()
    const top = target.getBoundingClientRect().top + window.scrollY - 70
    window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' })
  })
})

/* ---- Scroll-progress hairline (cached max + rAF-batched write) ---- */
const progress = document.getElementById('progress')
if (progress) {
  let max = 0, ticking = false
  const recalc = () => {
    const h = document.documentElement
    max = h.scrollHeight - h.clientHeight
  }
  const setProgress = () => {
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`
    ticking = false
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(setProgress) } }
  recalc(); setProgress()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', () => { recalc(); setProgress() })
}

/* ---- Year (kept at 1901 in spirit, current in fact) ---- */
const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = new Date().getFullYear()

import './styles.css'
import { initScene } from './scene.js'
import { loadPhotos } from './photos.js'
import { initReserve } from './reserve.js'
import { initSeason } from './season.js'

/* ---- Real Union Gables photography (graceful fallback to gradients) ---- */
loadPhotos()

/* ---- Reservation flow + date-aware seasonal hero ---- */
const reserve = initReserve()
initSeason()

/* ---- A room is a way in: clicking one opens the reservation, pre-chosen ---- */
document.querySelectorAll('.room').forEach((room) => {
  const name = room.querySelector('.room__name')?.textContent.trim()
  if (!name) return
  const hint = document.createElement('span')
  hint.className = 'room__reserve'
  hint.textContent = 'Reserve ' + name + ' →'
  room.appendChild(hint)
  const go = () => reserve && reserve.open(name)
  hint.addEventListener('click', go)
  room.querySelector('.room__plate')?.addEventListener('click', go)
})

/* ---- Three.js hero ---- */
const canvas = document.getElementById('gilded-canvas')
if (canvas) {
  // WebGL can fail (old hardware, blocked context). Fall back gracefully.
  try {
    initScene(canvas)
  } catch (err) {
    console.warn('Gilded scene unavailable; resting on the green.', err)
    canvas.style.display = 'none'
    document.body.style.background =
      'radial-gradient(120% 90% at 50% 0%, #14301f, #0a1a12)'
  }
}

/* ---- Nav: solidify on scroll ---- */
const nav = document.getElementById('nav')
const onScroll = () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 40)
}
onScroll()
window.addEventListener('scroll', onScroll, { passive: true })

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

/* ---- Smooth anchor scrolling with nav offset (reserve triggers excepted) ---- */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  if (link.hasAttribute('data-reserve')) return
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href')
    if (id.length < 2) return
    const target = document.querySelector(id)
    if (!target) return
    e.preventDefault()
    const top = target.getBoundingClientRect().top + window.scrollY - 70
    window.scrollTo({ top, behavior: 'smooth' })
  })
})

/* ---- Scroll-progress hairline ---- */
const progress = document.getElementById('progress')
if (progress) {
  const setProgress = () => {
    const h = document.documentElement
    const max = h.scrollHeight - h.clientHeight
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`
  }
  setProgress()
  window.addEventListener('scroll', setProgress, { passive: true })
  window.addEventListener('resize', setProgress)
}

/* ---- Year (kept at 1901 in spirit, current in fact) ---- */
const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = new Date().getFullYear()

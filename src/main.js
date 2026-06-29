import './styles.css'
import { initScene } from './scene.js'
import { loadPhotos } from './photos.js'

/* ---- Real Union Gables photography (graceful fallback to gradients) ---- */
loadPhotos()

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

/* ---- Smooth anchor scrolling with nav offset ---- */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
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

/* ---- Year (kept at 1901 in spirit, current in fact) ---- */
const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = new Date().getFullYear()

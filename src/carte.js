/* =========================================================================
   The Carte — Libby's menu card, rendered as the object on the table.

   A cream card in green ink under a gold hairline: the month, a seasonal
   epigraph, and the six-course format. The month turns with quiet arrows
   through the seasons ahead (the supper genuinely rotates monthly). The
   course lines name the format, not the dishes — the menu is the chef's,
   set days before from what the growers send, and we don't invent food.

   Around the card, the real supper-night photographs from the house's own
   gallery, tipped in like prints — lazy-loaded, and self-removing if the
   CDN ever refuses one.
   ========================================================================= */

const CDN = 'https://www.uniongables.com/files-sbbasic/ba_uniongablesinn_us/'

// Real photographs from Libby's gallery page, with their actual dates.
const PLATES = [
  { file: 'img_20250622_091251.jpg',     kicker: 'June, at the table' },
  { file: 'img_20250828_102009_552.jpg', kicker: 'Late August' },
  { file: 'img_20250829_135518_634.jpg', kicker: 'The next evening' },
  { file: 'img_3076.jpg',                kicker: 'From the kitchen' },
]

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']

// One line per season, in the house voice — never a dish we can't stand behind.
const EPIGRAPHS = [
  'What keeps, done slowly.',                    // winter
  'The first of what comes back.',               // spring
  'What the growers send, at the height of it.', // summer
  'The orchard and the last of the garden.',     // autumn
]
const seasonOf = (m) => (m === 11 || m <= 1) ? 0 : m <= 4 ? 1 : m <= 7 ? 2 : 3

export function initCarte() {
  if (typeof document === 'undefined') return
  const root = document.querySelector('.carte')
  if (!root) return
  const monthEl = root.querySelector('.carte__month')
  const epiEl = root.querySelector('.carte__epigraph')
  const card = root.querySelector('.carte__card')
  const prev = root.querySelector('.carte__nav--prev')
  const next = root.querySelector('.carte__nav--next')
  if (!monthEl || !card) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // The supper runs monthly: offer this month and the five ahead.
  const now = new Date()
  const cards = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    return {
      title: MONTHS[d.getMonth()] + ' ' + d.getFullYear(),
      epigraph: EPIGRAPHS[seasonOf(d.getMonth())],
    }
  })
  let idx = 0

  function render() {
    monthEl.textContent = cards[idx].title
    if (epiEl) epiEl.textContent = cards[idx].epigraph
    if (prev) prev.disabled = idx === 0
    if (next) next.disabled = idx === cards.length - 1
  }

  function turn(dir) {
    const to = Math.max(0, Math.min(cards.length - 1, idx + dir))
    if (to === idx) return
    idx = to
    if (reduced) { render(); return }
    card.classList.add('is-turning')
    setTimeout(() => {
      render()
      card.classList.remove('is-turning')
    }, 240)
  }

  prev?.addEventListener('click', () => turn(-1))
  next?.addEventListener('click', () => turn(1))
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); turn(-1) }
    if (e.key === 'ArrowRight') { e.preventDefault(); turn(1) }
  })
  render()

  /* ---- the tipped-in supper photographs, lazy ---- */
  const platesHost = root.querySelector('.carte__plates')
  if (platesHost) {
    PLATES.forEach(({ file, kicker }, i) => {
      const fig = document.createElement('figure')
      fig.className = 'carte__plate carte__plate--' + (i + 1)
      const img = document.createElement('img')
      img.alt = 'A supper night at Libby — ' + kicker.toLowerCase()
      img.decoding = 'async'
      img.dataset.src = CDN + file + '?w=520'
      const cap = document.createElement('figcaption')
      cap.textContent = kicker
      fig.append(img, cap)
      img.addEventListener('error', () => fig.remove(), { once: true })
      platesHost.appendChild(fig)
    })
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          obs.unobserve(entry.target)
          const img = entry.target.querySelector('img')
          if (img && img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src }
        })
      }, { rootMargin: '400px' })
      ;[...platesHost.children].forEach((f) => io.observe(f))
    } else {
      ;[...platesHost.querySelectorAll('img')].forEach((img) => {
        if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src }
      })
    }
  }
}

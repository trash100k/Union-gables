/* =========================================================================
   Scroll story — the page rewards the scroll.

   Four instruments, one rAF-batched scroll engine, all scrubbed directly
   off native scroll position (reversible, no wheel-hijacking):

   1. Pinned Season: the four movements play as slides inside one sticky
      viewport — the section tells the same story in a quarter the height.
   2. Typographic settle: every section headline assembles word by word —
      rising, un-blurring, tracking-in — as it enters the viewport.
   3. Ledger count-ups: 1863 / 1901 / 1.5 tick up when they arrive.
   4. Parallax: section photography drifts at a differential rate.

   prefers-reduced-motion disables all of it — the page reads as before.
   ========================================================================= */

const clamp01 = (v) => Math.max(0, Math.min(1, v))
const easeOut = (t) => 1 - Math.pow(1 - t, 3)

export function initScrollStory() {
  if (typeof document === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const jobs = []   // fns run on each scrolled frame

  /* ---- 1. The Season, pinned ------------------------------------------ */
  const season = document.getElementById('season')
  const pin = season?.querySelector('.season__pin')
  const items = season ? [...season.querySelectorAll('.timeline__item')] : []
  if (season && pin && items.length) {
    season.classList.add('is-pinned')
    const photo = season.querySelector('.season__photo')
    const dots = [...season.querySelectorAll('.sstory__dot')]
    items.forEach((it) => it.classList.remove('reveal'))
    const N = items.length

    jobs.push(() => {
      const rect = pin.getBoundingClientRect()
      const span = rect.height - window.innerHeight
      const p = clamp01(span > 0 ? -rect.top / span : 1)

      // which movement holds the stage
      const pos = p * N
      items.forEach((it, i) => {
        // local phase: -1 (gone up) … 0 (centred) … +1 (waiting below)
        const local = Math.max(-1, Math.min(1, pos - i - 0.5))
        const vis = 1 - Math.min(1, Math.abs(local) * 2.2)
        it.style.opacity = String(clamp01(vis))
        it.style.transform = `translateY(${-local * 46}px)`
        it.style.pointerEvents = vis > 0.5 ? 'auto' : 'none'
      })
      const active = Math.min(N - 1, Math.floor(pos))
      dots.forEach((d, i) => d.classList.toggle('is-on', i === active))

      // the photograph breathes forward as the story runs
      if (photo) photo.style.transform = `scale(${1.06 + p * 0.1}) translateY(${p * -18}px)`
    })
  }

  /* ---- 2. Typographic settle on section headlines ---------------------- */
  const heads = [...document.querySelectorAll('main h2.display')]
  const splitJobs = []
  heads.forEach((h) => {
    h.classList.remove('reveal')
    h.classList.add('is-visible', 'scrub-head')
    // wrap words in spans; keep <br> and other elements intact
    const wrap = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment()
        node.textContent.split(/(\s+)/).forEach((piece) => {
          if (!piece) return
          if (/^\s+$/.test(piece)) { frag.appendChild(document.createTextNode(piece)); return }
          const s = document.createElement('span')
          s.className = 'scrub-word'
          s.textContent = piece
          frag.appendChild(s)
        })
        node.replaceWith(frag)
      }
    }
    ;[...h.childNodes].forEach(wrap)
    const words = [...h.querySelectorAll('.scrub-word')]
    splitJobs.push(() => {
      const r = h.getBoundingClientRect()
      const vh = window.innerHeight
      // 0 when the headline crosses 96% of the viewport, 1 by 55%
      const p = clamp01((vh * 0.96 - r.top) / (vh * 0.41))
      words.forEach((w, i) => {
        const stag = words.length > 1 ? i / (words.length - 1) : 0
        const t = easeOut(clamp01(p * 1.6 - stag * 0.6))
        w.style.opacity = String(0.05 + 0.95 * t)
        w.style.transform = `translateY(${(1 - t) * 0.55}em)`
        w.style.filter = t > 0.98 ? 'none' : `blur(${(1 - t) * 5}px)`
        w.style.letterSpacing = `${(1 - t) * 0.12}em`
      })
    })
  })
  jobs.push(...splitJobs)

  /* ---- 3. Ledger count-ups --------------------------------------------- */
  const nums = [...document.querySelectorAll('.ledger__num')]
  if (nums.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        obs.unobserve(entry.target)
        const el = entry.target
        const raw = el.textContent.trim()
        const target = parseFloat(raw)
        if (!isFinite(target)) return          // leaves ∞ and friends alone
        const decimals = raw.includes('.') ? 1 : 0
        const t0 = performance.now()
        const dur = 1200
        const step = (now) => {
          const t = easeOut(clamp01((now - t0) / dur))
          el.textContent = (target * t).toFixed(decimals)
          if (t < 1) requestAnimationFrame(step)
          else el.textContent = raw
        }
        requestAnimationFrame(step)
      })
    }, { threshold: 0.6 })
    nums.forEach((n) => io.observe(n))
  }

  /* ---- 4. Parallax photography ----------------------------------------- */
  const PLX = [
    ['.hero__photo', 0.10],
    ['.weddings__photo', 0.08],
    ['.plate__photo', 0.08],
  ]
  PLX.forEach(([sel, speed]) => {
    const el = document.querySelector(sel)
    if (!el || !el.parentElement) return
    const host = el.parentElement
    jobs.push(() => {
      const r = host.getBoundingClientRect()
      if (r.bottom < 0 || r.top > window.innerHeight) return
      const mid = r.top + r.height / 2 - window.innerHeight / 2
      el.style.transform = `scale(1.08) translateY(${mid * -speed}px)`
    })
  })

  /* ---- the engine: one rAF per scrolled frame --------------------------- */
  let ticking = false
  const frame = () => { jobs.forEach((j) => j()); ticking = false }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame) } }
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  frame()
}

/* =========================================================================
   A quiet "aliveness" cursor layer.
   Fine-pointer devices only. Respects prefers-reduced-motion. Defensive.
   An antique-gold ring eased-follows the pointer with a tight center dot;
   it grows and softens over interactive elements, contracts on press, and
   gives `.magnetic` elements a few px of pull. Transform/opacity only.
   ========================================================================= */

export function initCursor() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const finePointer = window.matchMedia('(pointer: fine)')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (!finePointer.matches || reducedMotion.matches) return

  if (document.documentElement.dataset.cursor === 'on') return
  document.documentElement.dataset.cursor = 'on'

  const root = document.createElement('div')
  root.className = 'ug-cursor'
  root.setAttribute('aria-hidden', 'true')
  const ring = document.createElement('div')
  ring.className = 'ug-cursor__ring'
  const dot = document.createElement('div')
  dot.className = 'ug-cursor__dot'
  root.appendChild(ring)
  root.appendChild(dot)
  ;(document.body || document.documentElement).appendChild(root)
  document.documentElement.classList.add('ug-cursor-active')

  const INTERACTIVE = 'a, button, .room, [data-reserve], input, select, textarea'
  const LERP = 0.18
  const DOT_LERP = 0.35
  const MAG_RADIUS = 90
  const MAG_MAX = 6
  const MAG_EASE = 0.2

  let pointerX = window.innerWidth / 2
  let pointerY = window.innerHeight / 2
  let ringX = pointerX, ringY = pointerY
  let dotX = pointerX, dotY = pointerY
  let visible = false, hovering = false, rafId = 0

  const magnets = new Map() // el -> { x, y }

  function onMove(e) {
    pointerX = e.clientX
    pointerY = e.clientY
    if (!visible) { visible = true; root.classList.add('is-visible') }
  }
  function onEnterWindow() { visible = true; root.classList.add('is-visible') }
  function onLeaveWindow() { visible = false; root.classList.remove('is-visible') }
  function onDown() { root.classList.add('is-pressed') }
  function onUp() { root.classList.remove('is-pressed') }

  function onOver(e) {
    const t = e.target
    if (t && t.closest && t.closest(INTERACTIVE)) {
      if (!hovering) { hovering = true; root.classList.add('is-hover') }
    }
  }
  function onOut(e) {
    const t = e.target
    if (!t || !t.closest) return
    const from = t.closest(INTERACTIVE)
    if (!from) return
    const to = e.relatedTarget
    if (to && to.closest && to.closest(INTERACTIVE) === from) return
    hovering = false
    root.classList.remove('is-hover')
  }

  window.addEventListener('mousemove', onMove, { passive: true })
  window.addEventListener('mouseenter', onEnterWindow, { passive: true })
  document.addEventListener('mouseleave', onLeaveWindow, { passive: true })
  window.addEventListener('mousedown', onDown, { passive: true })
  window.addEventListener('mouseup', onUp, { passive: true })
  document.addEventListener('mouseover', onOver, { passive: true })
  document.addEventListener('mouseout', onOut, { passive: true })

  function onVisibility() {
    if (document.hidden) { cancelAnimationFrame(rafId); rafId = 0 }
    else if (!rafId) { rafId = requestAnimationFrame(tick) }
  }
  document.addEventListener('visibilitychange', onVisibility, { passive: true })

  function tick() {
    ringX += (pointerX - ringX) * LERP
    ringY += (pointerY - ringY) * LERP
    dotX += (pointerX - dotX) * DOT_LERP
    dotY += (pointerY - dotY) * DOT_LERP
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`
    dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`

    if (magnets.size) {
      magnets.forEach((state, el) => {
        let tx = 0, ty = 0
        const rect = el.getBoundingClientRect()
        if (rect.width && rect.height) {
          const cx = rect.left + rect.width / 2
          const cy = rect.top + rect.height / 2
          const dx = pointerX - cx, dy = pointerY - cy
          const dist = Math.hypot(dx, dy)
          if (dist < MAG_RADIUS) {
            const pull = (1 - dist / MAG_RADIUS) * MAG_MAX
            const inv = dist > 0 ? 1 / dist : 0
            tx = dx * inv * pull
            ty = dy * inv * pull
          }
        }
        state.x += (tx - state.x) * MAG_EASE
        state.y += (ty - state.y) * MAG_EASE
        if (Math.abs(state.x) < 0.05 && Math.abs(state.y) < 0.05) {
          state.x = 0; state.y = 0; el.style.transform = ''
        } else {
          el.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0)`
        }
      })
    }
    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)

  function refreshMagnets() {
    const found = document.querySelectorAll('.magnetic')
    const seen = new Set()
    found.forEach((el) => { seen.add(el); if (!magnets.has(el)) magnets.set(el, { x: 0, y: 0 }) })
    magnets.forEach((_, el) => { if (!seen.has(el)) { el.style.transform = ''; magnets.delete(el) } })
  }
  refreshMagnets()

  let mo = null
  if ('MutationObserver' in window) {
    let scheduled = false
    mo = new MutationObserver(() => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(() => { scheduled = false; refreshMagnets() })
    })
    mo.observe(document.body || document.documentElement, { childList: true, subtree: true })
  }

  function onPointerChange() { if (!finePointer.matches) destroy() }
  if (finePointer.addEventListener) finePointer.addEventListener('change', onPointerChange)
  else if (finePointer.addListener) finePointer.addListener(onPointerChange)

  function destroy() {
    cancelAnimationFrame(rafId); rafId = 0
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseenter', onEnterWindow)
    document.removeEventListener('mouseleave', onLeaveWindow)
    window.removeEventListener('mousedown', onDown)
    window.removeEventListener('mouseup', onUp)
    document.removeEventListener('mouseover', onOver)
    document.removeEventListener('mouseout', onOut)
    document.removeEventListener('visibilitychange', onVisibility)
    if (mo) mo.disconnect()
    magnets.forEach((_, el) => { el.style.transform = '' })
    magnets.clear()
    root.remove()
    document.documentElement.classList.remove('ug-cursor-active')
    delete document.documentElement.dataset.cursor
  }

  return destroy
}

export default initCursor

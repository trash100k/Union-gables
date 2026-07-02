/* =========================================================================
   The Rooms, as a vertical rolodex.

   Thirteen rooms in the footprint of one. The cards ride a 3D wheel behind a
   static gilded frame: the front card sits flat and interactive (its plate /
   name still open the detail drawer), its neighbours tilt back above and
   below and can be clicked to bring them forward. Arrows, keyboard, and the
   peeking cards all drive it. Reduced motion drops the tilt for a clean
   one-at-a-time stack.
   ========================================================================= */

export function initRolodex() {
  const root = document.querySelector('[data-rolodex]')
  if (!root) return
  const stage = root.querySelector('.rolodex__stage')
  const cards = stage ? [...stage.querySelectorAll('.room')] : []
  if (cards.length < 2) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const prevBtn = root.querySelector('.rolodex__nav--prev')
  const nextBtn = root.querySelector('.rolodex__nav--next')
  const nowEl = document.querySelector('.rolodex__now')
  const idxEl = document.querySelector('.rolodex__idx')
  const N = cards.length
  let active = 0

  cards.forEach((c, i) => {
    c.classList.add('rolodex__card')
    c.classList.remove('reveal') // our inline layout supersedes the reveal fade
    c.classList.add('is-visible')
    // clicking a card that isn't in front brings it forward (capture beats
    // the plate/name drawer handlers, which we let run only for the front card)
    c.addEventListener('click', (e) => {
      if (c.classList.contains('is-active')) return
      e.preventDefault()
      e.stopPropagation()
      active = i
      layout()
    }, true)
  })

  // shortest signed distance around the wheel
  function dist(i) {
    let d = i - active
    if (d > N / 2) d -= N
    if (d < -N / 2) d += N
    return d
  }

  function layout() {
    cards.forEach((c, i) => {
      const d = dist(i)
      const ad = Math.abs(d)
      const isActive = d === 0
      const visible = ad <= 2
      c.classList.toggle('is-active', isActive)
      c.classList.toggle('is-peek', visible && !isActive)

      if (!visible) {
        c.style.opacity = '0'
        c.style.visibility = 'hidden'
        c.style.pointerEvents = 'none'
        c.setAttribute('aria-hidden', 'true')
        c.setAttribute('inert', '')
        return
      }

      c.style.visibility = 'visible'
      c.style.pointerEvents = 'auto'
      if (reduced) {
        c.style.transform = 'translate(-50%, -50%)'
        c.style.opacity = isActive ? '1' : '0'
        c.style.visibility = isActive ? 'visible' : 'hidden'
        c.style.pointerEvents = isActive ? 'auto' : 'none'
      } else {
        const ty = d * 46
        const tz = -ad * 140
        const rot = d * -32
        c.style.transform =
          `translate(-50%, -50%) translateY(${ty}px) translateZ(${tz}px) rotateX(${rot}deg)`
        c.style.opacity = isActive ? '1' : ad === 1 ? '0.4' : '0.12'
      }
      c.style.zIndex = String(50 - ad)

      // only the front card is in the reading + tab order
      if (isActive) {
        c.removeAttribute('aria-hidden')
        c.removeAttribute('inert')
      } else {
        c.setAttribute('aria-hidden', 'true')
        c.setAttribute('inert', '')
      }
    })

    const name = cards[active].querySelector('.room__name')?.textContent.trim() || ''
    if (nowEl) nowEl.textContent = name
    if (idxEl) idxEl.textContent = String(active + 1)
  }

  function go(dir) { active = (active + dir + N) % N; layout() }

  prevBtn?.addEventListener('click', () => go(-1))
  nextBtn?.addEventListener('click', () => go(1))

  root.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp': case 'PageUp': e.preventDefault(); go(-1); break
      case 'ArrowDown': case 'PageDown': e.preventDefault(); go(1); break
      case 'Home': e.preventDefault(); active = 0; layout(); break
      case 'End': e.preventDefault(); active = N - 1; layout(); break
    }
  })

  // vertical swipe, but only when it doesn't start on an interactive target
  let downY = null
  root.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button, input, select, textarea, .room__plate, .room__name')) return
    downY = e.clientY
  })
  root.addEventListener('pointerup', (e) => {
    if (downY === null) return
    const dy = e.clientY - downY
    downY = null
    if (Math.abs(dy) > 44) go(dy < 0 ? 1 : -1)
  })

  layout()
  return { go, layout }
}

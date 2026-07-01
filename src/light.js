/* =========================================================================
   The light on the book.

   A single warm light source the reader can move. Its position (--light-x /
   --light-y, in viewport %) drives the raking sheen on the leather and the
   specular glint clipped to the gilt — so the gold catches the light and the
   padded hide lifts on the lit side as the pointer (or the device) moves.
   ========================================================================= */

export function initLight() {
  const root = document.documentElement
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // rest at upper-left, like the light in the hero photo
  let tx = 42, ty = 6
  let x = tx, y = ty

  const apply = () => {
    root.style.setProperty('--light-x', x.toFixed(2) + '%')
    root.style.setProperty('--light-y', y.toFixed(2) + '%')
  }
  apply()

  // Reduced motion: a fixed, flattering light. No tracking, no rAF.
  if (reduce) return

  let raf = 0
  const tick = () => {
    x += (tx - x) * 0.12
    y += (ty - y) * 0.12
    apply()
    raf = (Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05)
      ? requestAnimationFrame(tick)
      : 0
  }
  const wake = () => { if (!raf) raf = requestAnimationFrame(tick) }

  window.addEventListener('pointermove', (e) => {
    tx = (e.clientX / window.innerWidth) * 100
    ty = (e.clientY / window.innerHeight) * 100
    wake()
  }, { passive: true })

  // Tilt the book on devices that report orientation (no iOS permission prompt;
  // where it isn't granted, the pointer still drives it on desktop).
  const clamp = (v) => Math.max(-1, Math.min(1, v))
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null || e.beta == null) return
    tx = 50 + clamp(e.gamma / 40) * 50
    ty = 50 + clamp((e.beta - 45) / 40) * 42
    wake()
  }, { passive: true })

  // Pause the smoothing loop when the tab is hidden.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && raf) { cancelAnimationFrame(raf); raf = 0 }
  })
}

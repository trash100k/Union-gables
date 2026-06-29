/* =========================================================================
   A brief, elegant load veil. Not a spinner: a dark racing-green panel with
   the gold gable monogram whose hairline draws in, then the whole veil eases
   up and out. Total < ~1.4s. Cannot ever stick: a failsafe removes it no
   matter what — error, never-firing load event, slow asset.
   ========================================================================= */

export function initIntro() {
  const veil = document.getElementById('intro')
  if (!veil) return

  // Once-per-session option (opt-in): uncomment to show only on first page.
  // try {
  //   if (sessionStorage.getItem('ug-intro-shown')) { veil.remove(); return }
  //   sessionStorage.setItem('ug-intro-shown', '1')
  // } catch (_) {}

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let done = false
  const remove = () => {
    if (done) return
    done = true
    clearTimeout(failsafe)
    veil.classList.add('intro--gone')
    document.body.classList.add('is-ready')
    let pulled = false
    const pull = () => { if (pulled) return; pulled = true; veil.remove() }
    veil.addEventListener('transitionend', pull, { once: true })
    setTimeout(pull, 900)
  }

  // FAILSAFE first — the single guarantee the veil can never persist.
  const failsafe = setTimeout(remove, 2000)

  if (reduced) { remove(); return }

  requestAnimationFrame(() => veil.classList.add('intro--draw'))

  const lift = () => setTimeout(remove, 650)
  if (document.readyState === 'complete') lift()
  else window.addEventListener('load', lift, { once: true })
}

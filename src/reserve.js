/* =========================================================================
   Reservation — the house's own booking step.

   No third-party widget breaking the spell. A quiet, in-voice modal that
   collects the dates and hands the note to the house by email (mailto, so
   it genuinely sends), then confirms in the same breath. Any "Reserve"
   control — nav, hero, a room — opens it; a room opens it pre-chosen.
   ========================================================================= */

const HOUSE_EMAIL = 'stay@uniongables.com'

export function initReserve() {
  const modal = document.getElementById('reserve-modal')
  if (!modal) return
  const panel = modal.querySelector('.modal__panel')
  const form = document.getElementById('rform')
  const roomSelect = document.getElementById('rform-room')
  const errorEl = document.getElementById('rform-error')
  const stepForm = modal.querySelector('[data-step="form"]')
  const stepDone = modal.querySelector('[data-step="done"]')
  let lastFocus = null

  // sensible date floors: arrive >= today, depart > arrive
  const today = new Date().toISOString().slice(0, 10)
  form.arrive.min = today
  form.depart.min = today

  function open(roomName) {
    lastFocus = document.activeElement
    stepForm.hidden = false
    stepDone.hidden = true
    errorEl.hidden = true
    if (roomName && roomSelect) {
      const match = [...roomSelect.options].find((o) => o.value === roomName)
      roomSelect.value = match ? roomName : ''
    }
    modal.classList.add('is-open')
    modal.setAttribute('aria-hidden', 'false')
    document.body.style.overflow = 'hidden'
    // focus the first useful field
    setTimeout(() => form.arrive.focus(), 60)
  }

  function close() {
    modal.classList.remove('is-open')
    modal.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = ''
    if (lastFocus && lastFocus.focus) lastFocus.focus()
  }

  // open from any [data-reserve]; a room passes its name
  document.querySelectorAll('[data-reserve]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault()
      open(el.getAttribute('data-reserve') || '')
    })
  })

  // close: scrim, ✕, "back to the porch", Escape
  modal.querySelectorAll('[data-close]').forEach((el) =>
    el.addEventListener('click', close),
  )
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close()
  })

  // keep focus within the panel while open
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !modal.classList.contains('is-open')) return
    const f = panel.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const list = [...f].filter((el) => !el.hidden && el.offsetParent !== null)
    if (!list.length) return
    const first = list[0], last = list[list.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(form).entries())
    const missing = ['arrive', 'depart', 'name', 'email'].some((k) => !String(data[k] || '').trim())
    if (missing) { errorEl.hidden = false; return }
    errorEl.hidden = true

    const room = data.room || 'No preference'
    const subject = `A stay at Union Gables — ${data.arrive} to ${data.depart}`
    const body =
      `Arrive:  ${data.arrive}\n` +
      `Depart:  ${data.depart}\n` +
      `Guests:  ${data.guests}\n` +
      `Room:    ${room}\n` +
      `Name:    ${data.name}\n` +
      `Email:   ${data.email}\n` +
      (data.note ? `\nNote:\n${data.note}\n` : '') +
      `\n— sent from uniongables.com`

    // genuinely hands the note to the house
    window.location.href =
      `mailto:${HOUSE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    // ...and confirms in the same breath
    stepForm.hidden = true
    stepDone.hidden = false
    form.reset()
    stepDone.querySelector('[data-close]')?.focus()
  })

  // expose for other modules / debugging
  return { open, close }
}

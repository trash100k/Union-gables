/* =========================================================================
   Libby Supper Club — a table, by note.

   Six courses. One seating. A monthly prix-fixe the house chooses. The same
   quiet modal as the rooms, kept in its own voice: it gathers the night and
   the party, hands the note to Libby by email (mailto, so it genuinely
   sends), and sets the table in the same breath. Any [data-libby] opens it.
   ========================================================================= */

const LIBBY_EMAIL = 'dine@libbysupperclub.com'

export function initLibbyReserve() {
  const modal = document.getElementById('libby-modal')
  if (!modal) return
  const panel = modal.querySelector('.modal__panel')
  const form = document.getElementById('lform')
  const errorEl = document.getElementById('lform-error')
  const stepForm = modal.querySelector('[data-step="form"]')
  const stepDone = modal.querySelector('[data-step="done"]')
  let lastFocus = null

  // the supper runs select nights; floor the date at today
  const today = new Date().toISOString().slice(0, 10)
  form.date.min = today

  function open() {
    lastFocus = document.activeElement
    stepForm.hidden = false
    stepDone.hidden = true
    errorEl.hidden = true
    form.querySelectorAll('[aria-invalid]').forEach((f) => f.removeAttribute('aria-invalid'))
    modal.classList.add('is-open')
    modal.setAttribute('aria-hidden', 'false')
    document.body.style.overflow = 'hidden'
    setTimeout(() => form.date.focus(), 60)
  }

  function close() {
    modal.classList.remove('is-open')
    modal.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = ''
    if (lastFocus && lastFocus.focus) lastFocus.focus()
  }

  document.querySelectorAll('[data-libby]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault()
      open()
    })
  })

  modal.querySelectorAll('[data-close]').forEach((el) =>
    el.addEventListener('click', close),
  )
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close()
  })

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

  const REQUIRED = ['date', 'name', 'email']
  const clearMark = (field) => field && field.removeAttribute('aria-invalid')
  REQUIRED.forEach((k) => form.elements[k]?.addEventListener('input', (e) => clearMark(e.target)))

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(form).entries())
    const missing = REQUIRED.filter((k) => !String(data[k] || '').trim())
    REQUIRED.forEach((k) => clearMark(form.elements[k]))
    if (missing.length) {
      missing.forEach((k) => form.elements[k]?.setAttribute('aria-invalid', 'true'))
      errorEl.hidden = false
      form.elements[missing[0]]?.focus()
      return
    }
    errorEl.hidden = true

    const subject = `A table at Libby — ${data.date}`
    const body =
      `Date:    ${data.date}\n` +
      `Party:   ${data.party}\n` +
      `Name:    ${data.name}\n` +
      `Email:   ${data.email}\n` +
      (data.dietary ? `\nDietary:\n${data.dietary}\n` : '') +
      `\nSix courses. One seating.\n` +
      `— sent from uniongables.com`

    window.location.href =
      `mailto:${LIBBY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    stepForm.hidden = true
    stepDone.hidden = false
    form.reset()
    stepDone.querySelector('[data-close]')?.focus()
  })

  return { open, close }
}

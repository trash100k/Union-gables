/* =========================================================================
   The living calendar — the hero knows what time of year it is.

   Saratoga's whole rhythm is the meet (mid-July to Labor Day) and the
   quiet that follows. The hero reads the date and says the true thing for
   the season — so a regular who knows the calendar feels the house does
   too. Research-grounded, never shouted.
   ========================================================================= */

// first Monday of September = Labor Day (the meet's traditional close)
function laborDay(year) {
  const d = new Date(year, 8, 1)
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1)
  return d
}

function phraseFor(now) {
  const year = now.getFullYear()
  const meetStart = new Date(year, 6, 10) // ~July 10
  const meetEnd = laborDay(year)
  const md = (now.getMonth() + 1) * 100 + now.getDate()

  if (now >= meetStart && now <= meetEnd) {
    return { text: 'The meet is on. The gate is a block and a half left out the porch.', silk: true }
  }
  if (md >= 601 && md < 710) {
    return { text: 'The meet returns in July. The porch is keeping your chair.', silk: false }
  }
  if (now > meetEnd && md <= 1130) {
    return { text: 'The town is ours again, and the district is turning gold.', silk: false }
  }
  if (md >= 1201 || md <= 228) {
    return { text: 'Fires lit, streets quiet, the kettle on. Winter suits the house.', silk: false }
  }
  return { text: 'The gardens are coming back. So is everyone who knows them.', silk: false }
}

export function initSeason() {
  const el = document.getElementById('hero-season')
  if (!el) return
  const textEl = el.querySelector('.hero__season-text')
  const dotEl = el.querySelector('.hero__season-dot')
  const { text, silk } = phraseFor(new Date())
  textEl.textContent = text
  if (silk) dotEl.classList.add('hero__season-dot--silk')
  el.hidden = false
}

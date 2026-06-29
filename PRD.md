# Union Gables — Product Requirements Document

*The build spec for the redesigned uniongables.com. Reads on top of `DESIGN-BRIEF.md`
(strategy) and the verified Saratoga research. Prepared June 2026.*

---

## 1. Objective

Ship a site that makes an affluent, design-literate guest feel **let in** within one
screen — that this is a private 1901 Victorian house on the racing corridor with a supper
club, not a downtown hotel — and convert that feeling into a **direct booking** without a
single urgency tactic.

**Problem with the old site:** it was a dead brochure that *asked* to be booked. This one
must behave like a house that's quietly confident you'll come.

---

## 2. Goals & non-goals

**Goals**
- G1. Communicate the position (*trackside Victorian house + Libby Supper Club*) instantly.
- G2. Speak to affluence in a register that signals belonging, not selling (see §5 — the core of this PRD).
- G3. Drive **direct** reservations (rooms + Libby), reducing OTA dependence.
- G4. Work for *two cities*: the meet-season premium and the quiet off-season.
- G5. Feel "living, breathing" — motion and craft that never cost speed or legibility.

**Non-goals**
- Not a booking engine rebuild — we integrate the existing/!chosen reservation system, not replace it.
- Not a content-heavy CMS migration in v1 (Journal is phase 2).
- Not chasing budget/price-shopper traffic. We are comfortable being expensive.
- No live chat bot, no popups, no countdown timers, ever.

---

## 3. Success metrics

| Metric | Why | Target signal |
|---|---|---|
| Direct booking conversion rate | The point | ↑ vs. baseline; share of direct vs. OTA ↑ |
| Libby reservation clicks / inquiries | Differentiator working | Measurable demand off the site |
| Off-season package engagement | Fights seasonality | Non-meet-month booking lift |
| Scroll-depth past the hero, time on Rooms/Libby | Story landing | Engaged, not bouncing |
| LCP / INP (Core Web Vitals) | Affluence ≠ slow | LCP < 2.5s, INP < 200ms on mobile |
| Reduced-motion + a11y pass | Craft includes care | WCAG AA, no motion-sickness traps |

---

## 4. Audience (from research)

Primary: **the racing set** (owners, breeders, lifelong meet-goers) and **romance/anniversary
couples**. Secondary: **arts/SPAC visitors**, **wellness/springs seekers**, **weddings &
small private events**. Unifying trait: affluent (~$100k town median, meet crowd far higher),
over being marketed to, responsive to restraint and provenance. Full map in `DESIGN-BRIEF.md §3`.

---

## 5. How we talk to affluent clients  ⭐ (the heart of this build)

> **The rule of thumb:** the more expensive the experience, the quieter the copy. We never
> say *luxury* — we let 1901, the porch, and the antiques say it. We write to a peer who is
> already one of us, not to a prospect we're trying to win.

### 5.1 Ten voice principles

1. **Assume, don't justify.** Old money needs nothing explained. State the fact; let the
   reader supply the awe. *"A natural-gas fireplace in every room"* — not *"Enjoy the luxury
   of a romantic fireplace!"*
2. **Understate.** Drop every intensifier. If a sentence still lands without "stunning /
   breathtaking / world-class," it was always stronger without them.
3. **Never beg, never rush.** No "Book now," no scarcity theater. Scarcity is real here —
   state it **once, dry**: *"The season is short. The porch is not."*
4. **Provenance over features.** Lead with heritage and specificity (1901, the turret, the
   antiques chosen for the room). Specificity is the credential.
5. **Confidence = inclusion.** Write as if the reader already knows the meet, the Travers,
   "the season." Insider register flatters by assuming membership.
6. **Discretion.** Affluent guests want to be *known*, not *sold to*. "Concierge," "we'll
   make the bed for two and a half" — service implied, never boasted.
7. **Sensory and slow.** Evoke a moment, not a value prop. *"The smell of baking that drifts
   up around four o'clock."*
8. **Earned dryness / wit.** A little literary dryness signals education and self-assurance.
   Use sparingly; it's seasoning, not the dish.
9. **Accuracy is a flex.** Precise, correct claims (*"oldest organized major sporting venue,"*
   not "oldest racetrack") quietly prove we actually belong to this world.
10. **Restraint in punctuation.** No exclamation points. Em-dashes and full stops do the
    work. White space is part of the voice.

### 5.2 Lexicon

**Never use** (reads as new money / try-hard / brochure):
> luxury · luxurious · world-class · exclusive · VIP · indulge · pamper · nestled · oasis ·
> escape · getaway · unwind · elevate · curated (overused) · breathtaking · stunning ·
> "book now" · "don't miss" · "a stay you'll never forget"

**Reach for instead** (the house's own vocabulary):
> the season · the meet · the porch · the house (not "the property") · supper · the table ·
> kept · quiet · a block and a half · the garden two storeys down · after the last race ·
> period antiques · the turret · cooked to order · in spirit

### 5.3 Before → after (house style in practice)

| Brochure (✗) | Union Gables (✓) |
|---|---|
| "Book your luxurious getaway today!" | "If the dates are open, they're yours." |
| "Conveniently located near the famous racetrack" | "A block and a half from the first race." |
| "Our world-class chef prepares an unforgettable breakfast" | "Breakfast arrives cooked to order. Afternoons, something just out of the oven." |
| "Don't miss our exclusive supper club experience!" | "Six courses. One seating. Dinner kept the old way." |
| "Pamper yourself in our stunning Victorian suites" | "Oversized rooms, each with a name, each with its own fire." |
| "Pet-friendly rooms available" | "Eight rooms keep a place for the dog." |

### 5.4 Voice across the funnel

- **Hero:** one confident line, place + provenance. *Established register already in build —
  keep.*
- **Rooms:** name, then a single evocative paragraph, then a quiet tag line. No bullet-point
  amenity dumps in the primary view (details live one layer down for those who want them).
- **Libby:** the most restrained page on the site. Let the format (six courses, one seating)
  and the candlelight carry it.
- **Reserve:** the close is a permission, not a push. State availability plainly; let the
  reader decide they belong here.
- **Confirmation / transactional emails:** stay in voice. *"We've kept it for you."* The
  voice doesn't stop at the booking button.

### 5.5 Guardrails (accuracy = trust with this audience)
- ❌ "oldest racetrack in America" → ✅ "oldest organized major sporting venue" / "oldest
  continuously operating thoroughbred track" (Saratoga is ~4th-oldest by founding date).
- Attribute SPAC's scale figures to SPAC; never launder commissioned numbers as fact.
- Verify the *George Crippen / "Sunnyside"* house origin before it appears in copy.

---

## 6. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| F1 | Living hero (Three.js, reduced-motion fallback, graceful WebGL failure) | P0 — built |
| F2 | The Mansion — history, grounds, porch | P0 — built |
| F3 | The Rooms — all named rooms/suites; evocative primary view + details drawer; fireplace/turret/pet/view tags | P0 (expand from 3 to full inventory) |
| F4 | Libby Supper Club — story + reservation path (Tock/email) | P0 — built, wire booking |
| F5 | Reserve — direct-booking integration, understated persistent affordance, real availability | P0 — wire engine |
| F6 | The Season — NEW: the meet, the Travers, SPAC, the springs as reasons-you-came | P1 |
| F7 | Weddings & Gatherings — NEW: house + grounds + supper club as private venue + inquiry | P1 |
| F8 | Off-season packages — springs/wellness, romance, holiday, SPAC dinner-and-stay | P1 |
| F9 | Journal — slow content (a race remembered, a Libby recipe) | P2 |
| F10 | Real photography wired from manifest with graceful fallback | P0 — built |

---

## 7. Content requirements
- Final room inventory + one in-voice paragraph each (writer + property sign-off).
- Libby: confirm current format, reservation channel, dietary-night cadence.
- Confirm property history facts before publishing any historical claim (see §5.5).
- Photography direction per `DESIGN-BRIEF.md §6` (porch golden hour, candlelit table, brass detail).

---

## 8. Technical requirements
- **Stack:** Vite + Three.js (current). Static, host-agnostic build.
- **Performance:** LCP < 2.5s mobile; lazy-load photography; cap Three.js cost; pause render on hidden tab (built).
- **Accessibility:** WCAG AA; honor `prefers-reduced-motion` (built); keyboard nav; decorative canvas `aria-hidden` (built).
- **SEO/local:** semantic structure, schema.org `LodgingBusiness` + `Restaurant` (Libby), correct NAP (55 Union Avenue / (518) 584-1558), OpenGraph imagery from real photos.
- **Booking:** integrate chosen reservation engine for rooms; Tock/email for Libby. Direct-first.
- **Analytics:** privacy-respecting (no creepy retargeting that contradicts the discretion brand); track the §3 metrics.

---

## 9. Phasing

- **Phase 0 (done):** living redesign, real photography, manifest, brief.
- **Phase 1:** expand Rooms to full inventory; wire room + Libby booking; rewrite all copy to §5 voice; add The Season + Weddings; off-season packages; SEO/schema.
- **Phase 2:** Journal, seasonal hero states (meet vs. off-season), richer Weddings inquiry flow, transactional-email voice pass.

---

## 10. Risks & open questions
- **Booking-engine constraint** may cap how in-voice the final reservation step can be — scope early.
- **Hotlinked photography** depends on the inn's CDN; self-host from the manifest before launch.
- Unverified property history (Crippen/"Sunnyside"); meet-season rate-premium magnitude; visitor-segment mix — all in `DESIGN-BRIEF.md §10`, to close before Phase 1 copy is final.

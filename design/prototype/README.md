# Tip Split — design prototype (CP-2)

Interactive, browser-only reference for CP-3 (tip/total) and CP-4 (split). No
build step, no server, no dependencies beyond a Google Fonts stylesheet link.

## Run it

Open `design/prototype/index.html` directly in a browser, or serve the
folder locally, e.g.:

```
npx serve design/prototype
```

## What's real vs. mocked

- The calculation logic in `script.js` follows the CP-3 / CP-4 examples
  tables (half-up rounding to the cent, extra-cent split to the first
  guests) closely enough to demonstrate every UI state correctly.
- It is **not** the unit-tested production implementation. The Developer
  owns the pure, `node:test`-covered calculation functions in `src/` and
  should treat this file only as a UI/behavior reference, not a source to
  copy verbatim.
- Nothing is sent to a network or saved: refreshing the page resets all
  input. The banner at the top of the page states this for reviewers.

## Screens / journeys covered

Single page, no navigation:

1. Enter a bill, pick a tip (10/15/20% preset or custom %) → see tip and
   total.
2. Set the guest count (1–20, stepper or typed) → see the per-guest split,
   including which guests absorb the extra cent(s) when it doesn't divide
   evenly.

## Interface states included

- Empty / invitation state before a valid bill exists (placeholder `—.——`
  amounts, "Add a bill to split the total.").
- Inline validation errors for bill, custom percentage, and guest count
  (each described via `aria-describedby`, announced with `role="alert"`).
- Successful calculation state (tip, total, split, all live-updating via
  `aria-live="polite"`).
- No loading state: everything is synchronous, client-side arithmetic —
  there is nothing to wait on.

## Responsive behavior

- Single-column layout at all sizes (the content is inherently one
  narrow ticket; there is no multi-column desktop treatment).
- Checked at 375px, 768px, and 1280px viewport widths. Below 480px the
  receipt fills the available width with tighter side padding; at 480px
  and up it becomes a fixed 26rem card centered on the tabletop
  background, with more breathing room on either side as the viewport
  grows.
- Touch targets (stepper buttons, tip chips) are at least 44×44px
  throughout.

## Accessibility notes

- Semantic `<label for>` on every input; tip presets use
  `role="radiogroup"` / `role="radio"` with `aria-checked`.
- Visible focus rings (`outline`) on every interactive element, not just
  `:hover`.
- Validation messages are tied to their field via `aria-describedby` and
  announced via `role="alert"`.
- Color is never the only signal: every error state also has message
  text; the palette was checked against WCAG AA (4.5:1) for all
  text/background pairs used.
- Respects `prefers-reduced-motion`.

## Outstanding decisions

- Interface copy is in English by default (no language was specified in
  CP-2/CP-3/CP-4 or the Confluence project context). Flag if Alex wants a
  different language for the shipped product.

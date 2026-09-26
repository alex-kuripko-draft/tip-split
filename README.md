# Tip Split

A single static page that calculates a tip and splits the bill between people.
Micro-product used to rehearse the Buzz delivery flow end to end
(Epic **CP-2** on testing-alex.atlassian.net).

- Vanilla HTML/CSS/JS, no build step, no runtime dependencies.
- Tests: `npm test` (Node's built-in `node:test`).
- `develop` → automatic **dev** deployment (recorded via GitHub Deployments).
- **production** → GitHub Pages, only through the manual *Deploy production*
  workflow after an owner-authorized release.


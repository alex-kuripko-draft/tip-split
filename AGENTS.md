# AGENTS.md — Tip Split

Micro-product (Epic CP-2 on testing-alex.atlassian.net). Read the Jira Story,
the Confluence "Tip Split — Project Context" page and this file before work.

## Rules

- Vanilla HTML/CSS/JS in `src/`, no frameworks, no build step, no runtime
  dependencies. Tests in `test/` with `node:test`; run `npm test`.
- Branch from `develop`: `feature/CP-<n>-<slug>` (design prototypes:
  `design/CP-2-<slug>` with the PR label `design-review`). Put the Jira key in
  the branch name and PR title. PRs target `develop`.
- `main` and `develop` are protected: changes only through PRs with a green
  `test` check.

## GitHub Actions on this account (important)

Push and pull_request events do **not** start workflows for this account right
now; only manual runs work. Therefore:

1. After pushing a PR branch, start CI for it and wait for it to pass:
   `gh workflow run ci.yml --ref <branch>` then `gh run watch` (the run marks
   the `test` check on the PR head commit).
2. After merging into `develop`, start the dev deployment of the merge commit:
   `gh workflow run deploy-dev.yml --ref develop`, and confirm the `dev`
   deployment for that exact SHA succeeded
   (`gh api repos/alex-kuripko-draft/tip-split/deployments?environment=dev`).
3. Production (`deploy-production.yml`, input `sha`) is run by DevOps only for
   an owner-authorized `[delivery-operation]` of kind `release`.

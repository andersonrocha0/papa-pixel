# Research: Playwright E2E Validation

**Feature**: `001-playwright-e2e-tests` | **Date**: 2026-09-04

## 1. Runner and project layout

**Decision**: Use `@playwright/test` with `playwright.config.ts` at repo root and
tests under `e2e/`.

**Rationale**: Official Playwright Test runner; Angular community default for
modern E2E; keeps Karma unit specs untouched.

**Alternatives considered**:
- Protractor — deprecated; not appropriate for a new suite.
- Cypress — capable, but FR-011 requires Playwright.
- Put tests under `src/` — conflates with Karma; harder `webServer` mental model.

## 2. Dev server lifecycle

**Decision**: Configure `webServer` to run `npm start` (Angular `ng serve`),
`url`/`baseURL` `http://localhost:4200`, `reuseExistingServer: !process.env.CI`,
timeout ≥ 120s. Pipe stderr so boot failures are visible.

**Rationale**: Avoids race between starting the app and running tests; fails
clearly if the server never becomes ready (spec edge case).

**Alternatives considered**:
- Manual “start serve in another terminal” only — easy to forget; silent skips.
- Serve static `dist/` only — extra build step for local MVP; deferred.

## 3. Browser matrix

**Decision**: Chromium-only project for MVP.

**Rationale**: Meets SC-004 time budget and educational focus; Firefox/WebKit
can be added later without changing scenarios.

**Alternatives considered**: Full three-browser matrix — slower installs and runs
for little study value on day one.

## 4. Observing snake vs food on the grid

**Decision**: Add minimal presentational observability on each pixel:
`data-row`, `data-col`, `data-lit` (`"true"|"false"`), and `data-role`
(`"snake"|"food"|"empty"`), driven by Scene when painting. Do not change
movement, collision, or food algorithms.

**Rationale**: Today both snake and food share CSS class `.on`, so pure CSS
assertions cannot validate FR-006/FR-007 reliably with random food.

**Alternatives considered**:
- Snapshot only lit-cell counts — insufficient to prove food vs snake.
- Seed `Math.random` in tests — deeper intrusion into game code; still weak for
  collision setup.
- `window.__PAPAPIXEL__` test API — heavier than data attributes; worse for
  Constitution III clarity.

## 5. Timing and pause assertions

**Decision**: Use Playwright locators + polling (`expect.poll` / `toPass`) against
grid snapshots; derive tick expectations from `SceneSettings.initialSpeed`
(200ms) with comfortable margins. Prefer the Pause/Start button for
deterministic pause/resume; also cover Space where useful.

**Rationale**: Game loop uses `setTimeout`; fixed `waitForTimeout` alone is
flaky. Polling grid state matches “observe pixels” metaphor.

**Alternatives considered**: Fake timers in browser — brittle with Angular zone;
overkill for study E2E.

## 6. Game-over dialog

**Decision**: Register Playwright `page.on('dialog')` (or `waitForEvent('dialog')`)
to accept `alert("You lost!")`, then assert restart (initial snake length /
lit pattern and controls usable).

**Rationale**: Current code uses `alert`; E2E must not hang on the dialog
(spec edge case).

**Alternatives considered**: Replace `alert` with in-DOM banner — improves UX
but changes product behavior; out of scope (FR-010). Optional follow-up.

## 7. Collision and eat scenarios (controllability)

**Decision**: Prefer natural play where feasible (direction buttons + time).
For collision, drive the snake into itself with a short, documented sequence
of direction changes after enough length, or grow first then collide. If a
scenario remains flaky, add a **test-only** Scene method or query-param harness
as a last resort — document in tasks; default path avoids rule changes.

**Rationale**: Spec requires validating current rules; harness only if
observability + controls are not enough.

**Alternatives considered**: Purely random play until collision — unbounded time;
fails SC-004.

## 8. npm scripts and docs

**Decision**: Add `test:e2e` → `playwright test`; document one-time
`npx playwright install chromium` in quickstart/README snippet. No CI workflow
in this feature.

**Rationale**: Matches FR-008/SC-004; CI deferred per Assumptions.

**Alternatives considered**: GitHub Actions in MVP — useful later; expands scope
beyond educational local validation.

# Quickstart: Playwright E2E Validation

**Feature**: `001-playwright-e2e-tests` | **Date**: 2026-09-04

Validate the current minhoca game through the browser suite. See
[contracts/ui-observability.md](./contracts/ui-observability.md) for selectors
and [data-model.md](./data-model.md) for grid invariants.

## Prerequisites

- Node.js compatible with the existing Angular 13 toolchain
- Dependencies installed (`npm install`)
- Chromium for Playwright (one-time): `npx playwright install chromium`

## Setup (after implementation)

1. Ensure `playwright.config.ts` uses `webServer.command: npm start` and
   `baseURL: http://localhost:4200` (see [research.md](./research.md)).
2. Ensure the UI exposes the observability contract (grid `data-*`, control
   `data-testid`s).
3. Package script available: `npm run test:e2e` → `playwright test`.

## Run

```bash
npm run test:e2e
```

Optional: leave `ng serve` running; config should reuse the existing server
locally.

## Expected outcomes

| Check | Expected |
|-------|----------|
| Suite finishes | Exit code 0; under ~5 minutes locally |
| P1 smoke | Grid present; snake + food roles lit; auto-move changes snake cells |
| P2 controls | Pause freezes snake cells; resume moves again; direction buttons/keys change path |
| P3 rules | Eating increases snake count; collision shows `You lost!` then restart |
| Server down | Clear webServer / connection failure (not a silent green run) |

## Manual spot-check

1. `npm start` → open `http://localhost:4200`
2. Confirm grade, pause, arrows/buttons, and self-collision still feel like
   today’s game (no rule regressions for “making tests pass”).

## Failure triage

- Read Playwright report / failing test title (maps to smoke / controls / rules).
- Confirm contract attributes still present in DOM.
- If only food assertions flake, verify `data-role="food"` after paint.

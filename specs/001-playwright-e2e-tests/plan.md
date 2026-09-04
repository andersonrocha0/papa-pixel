# Implementation Plan: Playwright E2E Validation

**Branch**: `001-playwright-e2e-tests` (feature dir; git branch optional) | **Date**: 2026-09-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-playwright-e2e-tests/spec.md`

## Summary

Adicionar uma suíte Playwright que valida o comportamento atual da minhoca
observando a grade on/off e os controles (pausa, direção, comida, colisão),
sem mudar regras de jogo. Abordagem: `@playwright/test` com `webServer`
apontando para `ng serve`, testes em `e2e/`, e atributos de observabilidade
mínimos na grade para distinguir minhoca/comida e coordenadas.

## Technical Context

**Language/Version**: TypeScript ~4.6 (app) + TypeScript via Playwright Test runner

**Primary Dependencies**: Angular ~13.3 (existing); `@playwright/test` (new, FR-011)

**Storage**: N/A (client-only; no persistence)

**Testing**: Jasmine/Karma (existing unit); Playwright E2E (this feature); Chromium local MVP

**Target Platform**: Desktop browser against `http://localhost:4200` (Angular CLI serve)

**Project Type**: Single Angular SPA + sibling `e2e/` suite

**Performance Goals**: Full E2E suite completes in under 5 minutes locally (SC-004)

**Constraints**: Assert on pixel grid only (Constitution I); no rule changes (FR-010); food position random — no fixed coordinates; handle `alert("You lost!")`; fail clearly if app server down

**Scale/Scope**: ~6–10 scenarios covering P1–P3; Chromium only for MVP; CI out of scope

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

PapaPixel Constitution v1.0.0 — all items MUST pass (or be justified in Complexity Tracking):

- [x] **I. Pixel grid**: E2E asserts only on/off cells and controls; no new render path
- [x] **II. Scene × Pixel**: Pixel stays presentational; optional `data-*` inputs for row/col/role only; game logic remains in Scene
- [x] **III. Study clarity**: Suite and helpers use plain names (`load-grid`, `pause-resume`); no generic test framework abstraction beyond Playwright
- [x] **IV. Central config & explicit rules**: Tests derive expected cell count from `SceneSettings` (20×50) or live DOM; do not hardcode magic sizes in multiple places
- [x] **V. Educational scope**: Playwright justified below as explicit study objective (FR-011)
- [x] **Playable increment**: Feature delivers automated proof of the pixel metaphor (on/off, move, food, collision) rather than a new game mode

**Post-design re-check**: Still pass. Observability attributes do not introduce parallel rendering or move logic into Pixel. CI omitted to keep scope thin.

## Project Structure

### Documentation (this feature)

```text
specs/001-playwright-e2e-tests/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-observability.md
└── tasks.md             # /speckit-tasks (not this command)
```

### Source Code (repository root)

```text
e2e/
├── smoke.spec.ts              # P1: load, grid, auto-move
├── controls.spec.ts           # P2: pause, direction
├── rules.spec.ts              # P3: food, grow, collision+restart
└── helpers/
    └── grid.ts                # count lit cells, sample snapshot, pause helpers

playwright.config.ts           # webServer → npm start, baseURL :4200
package.json                   # scripts: test:e2e, playwright install note

src/app/
├── pixel/
│   ├── pixel.component.ts     # optional @Input data attrs: row, col, role
│   └── pixel.component.html   # bind data-row, data-col, data-role, data-lit
└── scene/
    ├── scene.component.ts     # pass coordinates/role when painting (no rule change)
    ├── scene.component.html   # stable selectors on control buttons (data-testid)
    └── scene.settings.ts      # unchanged source of truth for grid size/speed
```

**Structure Decision**: Keep the existing Angular single-project layout under `src/app/`.
Add a top-level `e2e/` suite and root `playwright.config.ts` (Angular + Playwright
community default). Do not nest under Karma `src/**/*.spec.ts`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Constitution V — new dependency Playwright | User-mandated E2E study tool (FR-011); validates current gameplay in a real browser | Karma/Jasmine alone cannot exercise full browser timing, keyboard, and `alert` dialogs as a player sees them |
| Minimal DOM observability (`data-role` / coords) | Snake and food are both `.on` today; E2E cannot assert food/growth/collision reliably without role or equivalent signal | CSS-only heuristics are flaky with random food and wrap; seeding RNG would require deeper game changes |

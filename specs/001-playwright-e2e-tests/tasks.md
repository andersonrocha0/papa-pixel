---
description: "Task list for Playwright E2E Validation"
---

# Tasks: Playwright E2E Validation

**Input**: Design documents from `/specs/001-playwright-e2e-tests/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories), `research.md`, `data-model.md`, `contracts/ui-observability.md`, `quickstart.md`

**Tests**: This entire feature implements an automated E2E test suite in Playwright to validate existing game functionality without altering gameplay rules.

**Organization**: Tasks are grouped into Setup, Foundational, and User Story phases (P1 → P2 → P3) to enable independent implementation and incremental validation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Every task includes exact file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install Playwright test runner and configure project tooling

- [X] T001 Install `@playwright/test` devDependency in `package.json`
- [X] T002 [P] Create Playwright configuration with webServer and Chromium settings in `playwright.config.ts`
- [X] T003 [P] Add `test:e2e` script to `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement the UI observability contract (`contracts/ui-observability.md`) so E2E tests can observe grid cells, snake/food roles, and interact with controls deterministically.

**⚠️ CRITICAL**: No user story test specs can pass until this phase is complete.

- [X] T004 Add `row`, `col`, and `role` inputs with data attributes in `src/app/pixel/pixel.component.ts` and `src/app/pixel/pixel.component.html`
- [X] T005 Compute and pass cell roles (`snake`, `food`, `empty`) and coordinates from Scene to Pixel in `src/app/scene/scene.component.ts`
- [X] T006 [P] Add `data-testid="game-grid"` and button selectors (`data-testid="btn-pause"`, `data-testid="btn-move-*"`) in `src/app/scene/scene.component.html`
- [X] T007 [P] Create shared Playwright locators, snapshot helpers, and polling utilities in `e2e/helpers/grid.ts`

**Checkpoint**: Foundation ready — grid is fully observable via DOM attributes and test helper is ready.

---

## Phase 3: User Story 1 - Confirmar carga e grade inicial (Priority: P1) 🎯 MVP

**Goal**: Automatically verify that the game loads, displays the full 20×50 pixel grid, shows the initial snake and food, and auto-advances over time.

**Independent Test**: Run `e2e/smoke.spec.ts` against the serving app and verify initial grid state and automatic movement without user input.

### Implementation for User Story 1

- [X] T008 [US1] Implement smoke test verifying grid dimensions (20×50), initial lit cells, and snake/food roles in `e2e/smoke.spec.ts`
- [X] T009 [US1] Implement smoke test asserting that the snake automatically advances positions over time in `e2e/smoke.spec.ts`

**Checkpoint**: At this point, User Story 1 (MVP) is fully functional and independently testable via `npm run test:e2e -- e2e/smoke.spec.ts`.

---

## Phase 4: User Story 2 - Validar pausa e mudança de direção (Priority: P2)

**Goal**: Automatically verify that pause freezes snake movement, resume restarts it, and directional controls (buttons and arrow keys) alter snake trajectory.

**Independent Test**: Run `e2e/controls.spec.ts` to confirm pause/resume behavior and directional movement response.

### Implementation for User Story 2

- [X] T010 [US2] Implement pause and resume tests via Pause/Start button and Space key in `e2e/controls.spec.ts`
- [X] T011 [US2] Implement direction change tests for Up, Down, Forward, and Backward via UI buttons and arrow keys in `e2e/controls.spec.ts`
- [X] T012 [US2] Implement test verifying that directional keypresses while paused do not advance snake until game is resumed in `e2e/controls.spec.ts`

**Checkpoint**: User Stories 1 and 2 both pass independently (`e2e/smoke.spec.ts` and `e2e/controls.spec.ts`).

---

## Phase 5: User Story 3 - Validar comida, crescimento e fim de jogo (Priority: P3)

**Goal**: Automatically verify that eating food increases snake length and spawns new food, and self-collision triggers the "You lost!" alert followed by game restart.

**Independent Test**: Run `e2e/rules.spec.ts` to observe food consumption/growth and handle self-collision dialog with restart verification.

### Implementation for User Story 3

- [X] T013 [US3] Implement food consumption and snake length increment test in `e2e/rules.spec.ts`
- [X] T014 [US3] Implement self-collision dialog handler for `alert("You lost!")` and verify state restart in `e2e/rules.spec.ts`

**Checkpoint**: Complete E2E coverage across all three user stories.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation updates and validation against quickstart guide.

- [X] T015 [P] Update `README.md` with Playwright browser installation commands and `npm run test:e2e` usage
- [X] T016 Run full validation suite per `specs/001-playwright-e2e-tests/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all test execution
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion (Foundation ready)
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion; can run in parallel with or after US1
- **User Story 3 (Phase 5)**: Depends on Phase 2 completion; best executed after US1/US2
- **Polish (Phase 6)**: Depends on all user story tests passing

### User Story Dependencies

- **User Story 1 (P1)**: Independent of other stories — tests only load, layout, and natural auto-tick
- **User Story 2 (P2)**: Independent of US3 — tests pause and direction control logic
- **User Story 3 (P3)**: Exercises food and collision rules; builds on movement and controls from US1/US2

### Parallel Opportunities

- **Phase 1**: `T002` (playwright.config.ts) and `T003` (package.json scripts) can run in parallel once dependencies are planned
- **Phase 2**: `T006` (HTML testids) and `T007` (e2e helpers) can be authored in parallel with `T004`/`T005`
- **User Stories**: `e2e/smoke.spec.ts`, `e2e/controls.spec.ts`, and `e2e/rules.spec.ts` are separate files and can be authored in parallel once Phase 2 is complete
- **Polish**: `T015` (README) can be updated in parallel with test verification

---

## Parallel Example: Foundational & User Stories

```bash
# Authors working on Foundation in parallel:
Developer A: "Add row, col, role inputs in src/app/pixel/pixel.component.ts and HTML" (T004)
Developer B: "Add data-testid selectors in src/app/scene/scene.component.html" (T006)
Developer C: "Create shared helpers in e2e/helpers/grid.ts" (T007)

# Authors writing specs in parallel after Foundation:
Developer A: "Implement smoke tests in e2e/smoke.spec.ts" (T008, T009)
Developer B: "Implement controls tests in e2e/controls.spec.ts" (T010, T011, T012)
Developer C: "Implement rules tests in e2e/rules.spec.ts" (T013, T014)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup: Playwright install + config)
2. Complete Phase 2 (Foundational: DOM observability contract)
3. Complete Phase 3 (US1: Smoke tests for load, grid layout, auto-tick)
4. **STOP and VALIDATE**: Run `npm run test:e2e -- e2e/smoke.spec.ts` to confirm MVP passes

### Incremental Delivery

1. Setup + Foundational → App exposes clean observability, Playwright runner runs
2. Add US1 (`smoke.spec.ts`) → Validate core load & tick (MVP complete)
3. Add US2 (`controls.spec.ts`) → Validate pause & directional controls
4. Add US3 (`rules.spec.ts`) → Validate food eating & collision restart
5. Polish (README + full validation) → Feature merge-ready

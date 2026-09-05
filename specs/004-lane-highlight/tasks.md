# Tasks: Destaque da Faixa de Navegação

**Input**: Design documents from `/specs/004-lane-highlight/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui-observability.md`, `quickstart.md`

**Tests**: Included — constitution requires domain rules to be unit-testable; the plan and quickstart require Karma lane helpers plus Playwright axis/index coverage.

**Organization**: Tasks are grouped by user story to enable incremental, playable delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **PapaPixel (Angular SPA)**: `src/app/scene/` for game logic and settings; `src/app/pixel/` for presentational cell API; `e2e/` for Playwright
- Pixel stays presentational: it may receive `[lane]` and paint it; it MUST NOT derive head or direction

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the brownfield touch list before changing cell appearance

- [x] T001 Confirm lane state will be derived in `src/app/scene/scene.component.ts` from head + `moveDirectionOld`, that helpers belong in `src/app/scene/scene.settings.ts`, and that `src/app/pixel/pixel.component.ts` only gains a presentational `[lane]` flag (no new service)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Named `ActiveLane` helpers that every story uses

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Write failing unit tests for `SceneSettings.laneFor` and `SceneSettings.cellIsOnLane` (`{ i: 0, j: 3 }` + `row` → `{ axis: 'row', index: 0 }`; `{ i: 2, j: 7 }` + `col` → `{ axis: 'col', index: 7 }`; `cellIsOnLane(0, 10, { axis: 'row', index: 0 })` true and `(1, 10, …)` false) in `src/app/scene/scene.settings.spec.ts`
- [x] T003 Implement types `LaneAxis` / `ActiveLane` plus `laneFor(head, axis)` and `cellIsOnLane(row, col, lane)` in `src/app/scene/scene.settings.ts` (do not import `Direction` from `src/app/scene/scene.component.ts`)

**Checkpoint**: Lane math is named, centralized, and proven without touching the template

---

## Phase 3: User Story 1 - Ver a faixa em que a minhoca está andando (Priority: P1) 🎯 MVP

**Goal**: On a running game, empty cells of the head’s current travel lane look slightly different; snake and food stay black. Opening match highlights row 0.

**Independent Test**: `npm start`, open `http://localhost:4200`. Row 0 empty cells are tinted (`#e8edf4`); other empty rows stay white. `[data-testid="game-grid"]` has `data-lane-axis="row"` and `data-lane-index="0"`. Snake and food on that row stay black.

### Tests for User Story 1

- [x] T004 [P] [US1] Write a failing Pixel unit test that `[lane]="true"` sets host `data-lane="true"` and that an `on` cell keeps the `.on` class when `lane` is true in `src/app/pixel/pixel.component.spec.ts`
- [x] T005 [P] [US1] Write a failing scene unit test that after `start()` / `detectChanges()`, `activeLane` is `{ axis: 'row', index: 0 }` and the grid has `data-lane-axis="row"` and `data-lane-index="0"` in `src/app/scene/scene.component.spec.ts`

### Implementation for User Story 1

- [x] T006 [US1] Add `@Input() lane = false` and `@HostBinding('attr.data-lane')` (`'true'` / `'false'`) in `src/app/pixel/pixel.component.ts`
- [x] T007 [US1] Tint empty lane cells with `:host([data-lane="true"]) .off { background-color: #e8edf4; }` and leave `.on` black in `src/app/pixel/pixel.component.css`
- [x] T008 [US1] Add `activeLane` (map `moveDirectionOld` Up/Down → `'col'`, else `'row'`, then `SceneSettings.laneFor(head, axis)`) and `isOnActiveLane(i, j)` in `src/app/scene/scene.component.ts`
- [x] T009 [US1] Bind `[attr.data-lane-axis]`, `[attr.data-lane-index]` on `[data-testid="game-grid"]` and `[lane]="isOnActiveLane(i, j)"` on `app-pixel` in `src/app/scene/scene.component.html`

**Checkpoint**: User Story 1 is playable — the opening row is hinted. Turns, wrap, pause, and reset are not required yet.

---

## Phase 4: User Story 2 - A faixa acompanha a cabeça e a direção (Priority: P1)

**Goal**: After an applied advance or turn, the hint leaves the old lane and marks only the new head row or column. Queued keys do not switch the axis until the tick applies them.

**Independent Test**: From the opening row, press Down and wait one advance. The row tint disappears; the head’s column is hinted. `data-lane-axis` becomes `"col"` and `data-lane-index` equals the head column. Pressing Down without waiting a tick must not switch the axis yet.

### Tests for User Story 2

- [x] T010 [P] [US2] Write a failing scene unit test that after an applied `moveDown()` the lane is `{ axis: 'col', index: head.j }`, and that setting `moveDirection` to Up without calling `move()` leaves axis `'row'` in `src/app/scene/scene.component.spec.ts`
- [x] T011 [P] [US2] Add a failing Playwright spec that after Move Down and one tick `data-lane-axis` is `"col"` and `data-lane-index` matches the snake head column, with no leftover full previous row of `data-lane="true"`, in `e2e/lane.spec.ts`

### Implementation for User Story 2

- [x] T012 [US2] Confirm (and fix if needed) that `activeLane` reads `moveDirectionOld` plus the current head so wrap and applied turns update index/axis, without using queued `moveDirection`, in `src/app/scene/scene.component.ts`
- [x] T013 [P] [US2] Add optional helpers to read `data-lane-axis` / `data-lane-index` and `data-lane="true"` cells in `e2e/helpers/grid.ts`

**Checkpoint**: User Stories 1 and 2 work — the lane follows the head after travel and turns. Contract: `specs/004-lane-highlight/contracts/ui-observability.md`

---

## Phase 5: User Story 3 - A faixa continua útil com o jogo pausado ou recomeçado (Priority: P2)

**Goal**: Pause keeps the current lane visible; a new game shows the opening row, not the previous match’s column.

**Independent Test**: Pause on a highlighted column — tint and attributes stay. Collide, dismiss `You lost!`, and confirm `data-lane-axis="row"` / `data-lane-index="0"` again.

### Tests for User Story 3

- [x] T014 [P] [US3] Write a failing scene unit test that pause after a vertical move keeps `{ axis: 'col', index }`, and that `start()` after that trip restores `{ axis: 'row', index: 0 }` in `src/app/scene/scene.component.spec.ts`
- [x] T015 [P] [US3] Extend Playwright coverage in `e2e/lane.spec.ts` so pause leaves axis/index unchanged and `You lost!` + restart returns `data-lane-axis="row"` and `data-lane-index="0"`

### Implementation for User Story 3

- [x] T016 [US3] Confirm `pause()` / `unpause()` never assign lane state, and that `start()` resets `moveDirection` / `moveDirectionOld` to Forward with head `(0, 3)` so `activeLane` is `{ axis: 'row', index: 0 }`, in `src/app/scene/scene.component.ts`

**Checkpoint**: Pause is useful for planning; a new session never inherits the previous lane

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Regression gate and quickstart validation

- [x] T017 [P] Run Karma unit tests (`npm test -- --watch=false --browsers=ChromeHeadless`) covering `src/app/scene/scene.settings.spec.ts`, `src/app/scene/scene.component.spec.ts`, and `src/app/pixel/pixel.component.spec.ts`
- [x] T018 [P] Run Playwright `e2e/smoke.spec.ts`, `e2e/controls.spec.ts`, `e2e/rules.spec.ts`, `e2e/speed.spec.ts`, and `e2e/lane.spec.ts` and keep them green
- [x] T019 Execute the manual scenarios in `specs/004-lane-highlight/quickstart.md` (opening row, horizontal travel, turn to column, pause, wrap, reset, no overlay)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 — MVP
- **User Story 2 (Phase 4)**: Depends on US1 (`activeLane` getter + `[lane]` bindings)
- **User Story 3 (Phase 5)**: Depends on US1 painting; pause/reset assertions are stronger after US2 can put the snake on a column
- **Polish (Phase 6)**: Depends on the stories you intend to ship

### User Story Dependencies

- **US1 (P1)**: After Foundational only
- **US2 (P1)**: Needs US1’s Pixel input, CSS tint, and scene bindings
- **US3 (P2)**: Needs US1 visible lane; E2E reset is easiest after US2 can leave a non-opening lane

`scene.component.ts` / `.html` and `pixel.component.ts` are shared — prefer sequential US1 → US2 → US3 on a single implementer.

### Within Each User Story

- Tests listed first MUST fail before the matching implementation
- Helpers in `scene.settings.ts` before scene getters
- Pixel `[lane]` + CSS before template bindings
- Story complete before the next priority when files overlap

### Parallel Opportunities

- T004 and T005 (US1 tests, different files) after T003
- T010 and T011 (US2 tests, different files) after US1
- T013 can run beside T012 (helper file vs scene class)
- T014 and T015 (US3 tests, different files)
- T017 and T018 in Polish

---

## Parallel Example: User Story 1

```bash
# After T003, launch US1 tests together:
Task: "Failing data-lane HostBinding test in src/app/pixel/pixel.component.spec.ts"
Task: "Failing opening-row grid attribute test in src/app/scene/scene.component.spec.ts"

# Then implement sequentially (pixel API before template):
Task: "[lane] + data-lane in src/app/pixel/pixel.component.ts"
Task: "off-cell tint in src/app/pixel/pixel.component.css"
Task: "activeLane / isOnActiveLane in src/app/scene/scene.component.ts"
Task: "grid + pixel bindings in src/app/scene/scene.component.html"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (`laneFor` / `cellIsOnLane`)
3. Complete Phase 3: User Story 1 (Pixel flag + opening row tint)
4. **STOP and VALIDATE**: Row 0 empty cells look different; snake/food stay black
5. Demo the playable increment

### Incremental Delivery

1. Setup + Foundational → helpers ready
2. US1 → opening row hinted (MVP)
3. US2 → lane follows applied turns and wrap
4. US3 → pause keeps the hint; new game is row 0
5. Polish → Karma + Playwright + `quickstart.md`

### Parallel Team Strategy

1. Together: T001–T003
2. Then: implementer A on `pixel.component.ts` / `.css` (T006–T007); implementer B on `scene.component.ts` getters (T008)
3. T009 after both A and B land
4. E2E `e2e/lane.spec.ts` can start after T009

---

## Notes

- [P] = different files, no unfinished dependency
- Do not draw the lane with canvas, SVG, or a non-pixel overlay
- Do not highlight both a row and a column (no crosshair)
- Do not add a LaneService or a player toggle
- Derive lane; do not cache a second copy that can desync on `reverse()` / `start()`
- Existing E2E waits of ~220 ms remain valid at game start
- Commit after each task or story checkpoint
- Suggested next command: `/speckit-implement`

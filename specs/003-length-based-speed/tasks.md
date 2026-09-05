# Tasks: Length-Based Snake Speed

**Input**: Design documents from `/specs/003-length-based-speed/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui-observability.md`, `quickstart.md`

**Tests**: Included — constitution requires domain rules to be unit-testable; the plan and quickstart require Karma formula tests plus Playwright HUD/reset coverage.

**Organization**: Tasks are grouped by user story to enable incremental, playable delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **PapaPixel (Angular SPA)**: `src/app/scene/` for game logic and settings; `e2e/` for Playwright
- Do **not** change `src/app/pixel/` (Constitution II)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the brownfield touch list before changing game rules

- [x] T001 Confirm speed is only read in `move()` / `start()` today and that `src/app/pixel/pixel.component.ts` stays presentational (no speed logic) by reading `src/app/scene/scene.component.ts` and `src/app/pixel/pixel.component.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Central speed formula that every story uses

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Write failing unit tests for `SceneSettings.speedForLength` and `SceneSettings.speedLevelForLength` (length 4 → 200/1, 5 → 190/2, 9 → 150/6, 14 → 100/11, 20 → 100/11) in `src/app/scene/scene.settings.spec.ts`
- [x] T003 Implement `speedStep` (10), `minSpeed` (100), `initialLength` (4), `speedForLength`, and `speedLevelForLength` in `src/app/scene/scene.settings.ts`

**Checkpoint**: Formula is named, centralized, and proven without touching the game loop

---

## Phase 3: User Story 1 - A minhoca acelera ao crescer (Priority: P1) 🎯 MVP

**Goal**: After each food (below the cap), the next tick uses a shorter delay so the snake is visibly faster.

**Independent Test**: Start the game (`npm start`), note the opening pace, eat one food, and confirm the following advances arrive sooner (200 ms → 190 ms). Repeat a few times; each extra segment below the cap is another −10 ms.

### Tests for User Story 1

- [x] T004 [US1] Write a failing scene unit test that after one simulated growth `component.speed` becomes `190` in `src/app/scene/scene.component.spec.ts`

### Implementation for User Story 1

- [x] T005 [US1] Add `applySpeedFromLength()` on `SceneComponent` that sets `this.speed = SceneSettings.speedForLength(this.snakePosition.length)` in `src/app/scene/scene.component.ts`
- [x] T006 [US1] Call `applySpeedFromLength()` once per tick after the directional `move*()` in `move()` so growth takes effect on the **next** `setTimeout` in `src/app/scene/scene.component.ts`

**Checkpoint**: User Story 1 is playable — eating food speeds the snake up. Cap and HUD are not required yet.

---

## Phase 4: User Story 2 - Nova partida volta ao ritmo inicial (Priority: P2)

**Goal**: `start()` (including after “You lost!”) restores opening length **and** opening interval.

**Independent Test**: Eat until the snake is clearly faster, collide with the body, dismiss `You lost!`, and confirm the new game uses the opening pace again.

### Tests for User Story 2

- [x] T007 [US2] Write a failing unit test that sets `component.speed` to a faster value, calls `start()`, and expects `component.speed === SceneSettings.initialSpeed` in `src/app/scene/scene.component.spec.ts`

### Implementation for User Story 2

- [x] T008 [US2] Reset pace inside `start()` by calling `applySpeedFromLength()` after the snake is restored to `originalSnakePosition` in `src/app/scene/scene.component.ts`

**Checkpoint**: A new session never inherits the previous game’s speed

---

## Phase 5: User Story 4 - Ver a velocidade atual na tela (Priority: P2)

**Goal**: Always-visible read-only HUD outside the pixel grid showing the current speed level.

**Independent Test**: On load, read `Speed: 1` beside the controls. After a food, the label increments. Pause does not hide or zero it. Nothing is painted as pixels inside `[data-testid="game-grid"]`.

### Tests for User Story 4

- [x] T009 [P] [US4] Write a failing scene unit test that after `detectChanges()` the HUD has `data-testid="speed-indicator"`, `data-speed="1"`, and `data-interval-ms="200"` in `src/app/scene/scene.component.spec.ts`
- [x] T010 [P] [US4] Add a failing Playwright test that the indicator is visible at level 1 and `data-speed` increases after `autoSteerToFood` in `e2e/speed.spec.ts`

### Implementation for User Story 4

- [x] T011 [US4] Expose `speedLevel` as a getter (`SceneSettings.speedLevelForLength(this.snakePosition.length)`) in `src/app/scene/scene.component.ts`
- [x] T012 [US4] Render a read-only `[data-testid="speed-indicator"]` with `[attr.data-speed]` and `[attr.data-interval-ms]` and visible text `Speed: {{ speedLevel }}` **outside** `[data-testid="game-grid"]` in `src/app/scene/scene.component.html`
- [x] T013 [US4] Add minimal placement styles so the HUD sits with the existing control buttons, not inside the grid, in `src/app/scene/scene.component.css`

**Checkpoint**: Player can read speed without estimating ticks. Contract: `specs/003-length-based-speed/contracts/ui-observability.md`

---

## Phase 6: User Story 3 - O ritmo acelera, mas o jogo continua jogável (Priority: P3)

**Goal**: Interval never drops below 100 ms; pause/direction/food/collision stay unchanged at any pace.

**Independent Test**: Grow until `data-speed="11"` / `data-interval-ms="100"`. Eat again — body grows, pace does not. Each step is still visible and a turn still fits between advances. Pause freezes motion; the HUD stays put.

### Tests for User Story 3

- [x] T014 [P] [US3] Extend unit tests so length ≥ 14 stays at speed `100` / level `11` after extra growth in `src/app/scene/scene.settings.spec.ts`
- [x] T015 [P] [US3] Add Playwright coverage that after many eats `data-interval-ms` is `"100"` and a further eat does not lower it, and that after `You lost!` it returns to `"200"` / `data-speed="1"`, in `e2e/speed.spec.ts`

### Implementation for User Story 3

- [x] T016 [US3] Confirm `pause()`, `unpause()`, and `togglePause()` never assign `this.speed` in `src/app/scene/scene.component.ts`
- [x] T017 [US3] Confirm wrap, reverse, food spawn, and self-collision `alert("You lost!")` paths are unchanged except for the shared `applySpeedFromLength()` call in `src/app/scene/scene.component.ts`

**Checkpoint**: Cap is playable; existing rules still hold at max speed

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Regression gate and quickstart validation

- [x] T018 [P] Run Karma unit tests (`npm test -- --watch=false --browsers=ChromeHeadless`) covering `src/app/scene/scene.settings.spec.ts` and `src/app/scene/scene.component.spec.ts`
- [x] T019 [P] Run Playwright `e2e/smoke.spec.ts`, `e2e/controls.spec.ts`, and `e2e/rules.spec.ts` and keep them green with the new HUD
- [x] T020 Execute the manual scenarios in `specs/003-length-based-speed/quickstart.md` (start pace, growth, cap, reset, HUD outside the grid)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 — MVP
- **User Story 2 (Phase 4)**: Depends on US1 (`applySpeedFromLength` + `start()`)
- **User Story 4 (Phase 5)**: Depends on US1 (live `speed` / length). Can overlap US2 if staffing allows, but both edit `scene.component.ts` / `.html`
- **User Story 3 (Phase 6)**: Depends on Phase 2 formula + US1 apply-on-tick; HUD assertions need US4
- **Polish (Phase 7)**: Depends on the stories you intend to ship

### User Story Dependencies

- **US1 (P1)**: After Foundational only
- **US2 (P2)**: Needs US1’s `applySpeedFromLength`
- **US4 (P2)**: Needs US1 length→speed; template can start after T011
- **US3 (P3)**: Needs formula cap (T003) and apply-on-tick (T006); E2E reset+cap needs US2 + US4

`scene.component.ts` is shared — prefer sequential US1 → US2 → US4 → US3 on a single implementer.

### Within Each User Story

- Tests listed first MUST fail before the matching implementation
- Helpers in `scene.settings.ts` before loop wiring
- Loop wiring before HUD
- Story complete before the next priority when files overlap

### Parallel Opportunities

- T009 and T010 (US4 tests, different files) after US1 exists
- T014 and T015 (US3 tests, different files)
- T018 and T019 in Polish
- Two people: one on `scene.settings.ts` / `scene.settings.spec.ts`, one on E2E `e2e/speed.spec.ts`, after T003

---

## Parallel Example: User Story 4

```bash
# After US1 is in place, launch US4 tests together:
Task: "Failing HUD binding test in src/app/scene/scene.component.spec.ts"
Task: "Failing Playwright indicator test in e2e/speed.spec.ts"

# Then implement sequentially (same scene files):
Task: "speedLevel getter in src/app/scene/scene.component.ts"
Task: "HUD markup in src/app/scene/scene.component.html"
Task: "HUD CSS in src/app/scene/scene.component.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (formula + unit table)
3. Complete Phase 3: User Story 1 (apply speed after each tick)
4. **STOP and VALIDATE**: Eat food; next steps are faster
5. Demo the playable increment

### Incremental Delivery

1. Setup + Foundational → formula ready
2. US1 → snake speeds up on growth (MVP)
3. US2 → new game restores 200 ms
4. US4 → `Speed: N` on screen
5. US3 → hard cap at 100 ms + pause/rules intact
6. Polish → Karma + Playwright + `quickstart.md`

### Parallel Team Strategy

1. Together: T001–T003
2. Then: implementer A on `scene.component.ts` (US1/US2/US3); implementer B on `e2e/speed.spec.ts` + `scene.settings.spec.ts` (tests)
3. HUD (`scene.component.html` / `.css`) after `speedLevel` exists

---

## Notes

- [P] = different files, no unfinished dependency
- Do not put speed digits on `app-pixel` cells
- Do not add a `SpeedService` or replace `setTimeout` with `setInterval` / rAF
- Existing E2E waits of ~220 ms remain valid at game start (200 ms cadence)
- Commit after each task or story checkpoint
- Suggested next command: `/speckit-implement`

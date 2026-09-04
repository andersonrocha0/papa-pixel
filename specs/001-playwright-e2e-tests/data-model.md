# Data Model: Playwright E2E Validation

**Feature**: `001-playwright-e2e-tests` | **Date**: 2026-09-04

This feature does not introduce persistent storage. The “model” is the
observable game state on the pixel grid plus verification scenarios.

## Entities

### PixelCell (observable)

| Field | Type | Notes |
|-------|------|--------|
| row | integer ≥ 0 | Maps to Scene line index |
| col | integer ≥ 0 | Maps to Scene column index |
| lit | boolean | On/off visual state |
| role | `empty` \| `snake` \| `food` | Observability for E2E; empty when off |

**Validation**:
- `row` ∈ `[0, lines)` and `col` ∈ `[0, columns)` per `SceneSettings`
- Exactly the grid size `lines × columns` cells rendered
- When `lit === false`, `role` MUST be `empty`
- Snake segments and food cells MUST be `lit === true` with matching role

### Snake

| Field | Type | Notes |
|-------|------|--------|
| segments | ordered list of `{row,col}` | Head is last segment in current code |
| length | integer ≥ 1 | Increases when food is eaten |

**Relationships**: Each segment corresponds to a `PixelCell` with `role=snake`.

**State transitions**:
- Tick + direction → new head cell; body follows; optional wrap at edges
- Eat food → length + 1; food respawns
- Self-collision → dialog → restart to initial snake

### Food

| Field | Type | Notes |
|-------|------|--------|
| cells | set of `{row,col}` | Currently one cell |

**Relationships**: Each food cell is `PixelCell` with `role=food`.

**Validation**: Position MUST be inside the grid; MUST NOT assume fixed coords
in tests.

### PauseControl

| Field | Type | Notes |
|-------|------|--------|
| paused | boolean | When true, ticks do not advance snake |

**Transitions**: running ↔ paused via Pause/Start button or Space.

### DirectionIntent

| Field | Values | Notes |
|-------|--------|--------|
| direction | up \| down \| forward \| backward | Arrow keys / Move buttons |

**Validation**: While paused, keyboard direction (except Space) does not apply
until resume (current behavior).

### VerificationScenario

| Field | Type | Notes |
|-------|------|--------|
| id | string | e.g. `smoke-load-grid` |
| story | P1 \| P2 \| P3 | Maps to spec user stories |
| outcome | pass \| fail | Playwright result |
| failureHint | string | Readable flow name for FR-009 |

## Grid invariants (for assertions)

1. Cell count = `SceneSettings.lines * SceneSettings.columns` (20×50 today).
2. Count of `role=snake` equals snake length after each settled paint.
3. Count of `role=food` ≥ 1 while a run is active (after start).
4. Auto-move: within > 1 tick interval, snake cell set changes unless paused.
5. After game-over accept: snake returns to initial length/shape and game is
   interactive again.

# Technical Research: Destaque da Faixa de Navegação

**Feature**: `004-lane-highlight`  
**Date**: 2026-09-04

This document resolves the planning decisions deferred from the spec: how to paint a lane on the pixel grid, which head/direction pair defines the lane, the tint, and where those rules live.

---

## 1. Painting the lane on the pixel grid

- **Decision**: Empty cells on the active lane keep `on === false` and gain a presentational `[lane]` flag. Pixel CSS tints `.off` only when the host has `data-lane="true"`. Snake and food stay `on` (black) even if they sit on the lane.
- **Rationale**: FR-011 and Constitution I require the hint to live on grid cells, not a canvas/SVG overlay. FR-004/FR-005 require a subtle empty-cell difference that never impersonates a lit cell. A second *off* appearance is still the on/off matrix.
- **Alternatives considered**:
  - *Background on `.line` / `.column` wrappers only*: Works visually, but tests and Constitution I are clearer when each cell declares whether it is on the lane.
  - *Paint the lane as extra `on` cells*: Rejected; would look like a wall of snake/food (FR-004).
  - *Crosshair (row and column)*: Rejected by the spec (no cruzeta).
  - *Dedicated overlay component*: Rejected; parallel render path (Constitution I) and extra abstraction (III).

---

## 2. Which direction defines the axis

- **Decision**: Axis comes from the last *applied* direction (`moveDirectionOld`), not the queued `moveDirection`. Index comes from the current head (`snakePosition` last cell).

  | Applied direction | Axis | Index |
  |-------------------|------|-------|
  | Forward / Backward | `row` | `head.i` |
  | Up / Down | `col` | `head.j` |

  After `start()`, both direction fields are `Forward` and the head is `(0, 3)`, so the opening lane is row `0` before the first tick.
- **Rationale**: Spec US2.3/US2.4 switch the highlight when the head *completes* the turn, not when the player only queues a key. Using the queued direction would flash the column before the snake actually goes vertical and mislead alignment (the failure mode US2 exists to prevent). `moveDirectionOld` is already the “last executed move” flag used by reverse detection.
- **Alternatives considered**:
  - *Use `moveDirection` (queued)*: Rejected; highlight would change on keydown before the advance.
  - *Highlight every row/column occupied by the body*: Rejected; spec says head-only; after curves that would light many lanes.
  - *Update only inside each `move*()`*: Rejected; a getter from head + `moveDirectionOld` stays correct after `start()`, `reverse()`, wrap, and pause without four copies.

---

## 3. Named helpers and ownership

- **Decision**:
  - `SceneSettings.laneFor(head, axis)` → `{ axis, index }` where `index` is `head.i` for `row` and `head.j` for `col`.
  - `SceneSettings.cellIsOnLane(row, col, lane)` → boolean.
  - `SceneComponent.activeLane` maps `moveDirectionOld` to `'row' | 'col'` and calls `laneFor`.
  - `SceneComponent.isOnActiveLane(i, j)` is the template predicate.
  - Settings do **not** import the `Direction` enum (avoids a cycle with `scene.component.ts`).
- **Rationale**: Constitution II/IV: scene is the engine, rules are named and central. Helpers stay unit-testable without mounting the loop. Pixel only receives a boolean.
- **Alternatives considered**:
  - *`LaneService`*: Rejected as a generic engine for two pure functions (Constitution III).
  - *Inline `i === head.i` in the template*: Rejected; hides the row-vs-column rule and is easy to get wrong on turns.
  - *Move `Direction` into `scene.settings.ts`*: Unnecessary churn for this feature.

---

## 4. Tint token

- **Decision**: One CSS rule on `PixelComponent`:

  `:host([data-lane="true"]) .off { background-color: #e8edf4; }`

  Plain `.off` stays `white`. `.on` stays `black` regardless of `data-lane`.
- **Rationale**: `#e8edf4` is a cool gray-blue clearly off-white on a desktop monitor and still far from black, so snake/food stay dominant (FR-004, SC-006). Color is presentation, not a game rule, so it lives in pixel CSS rather than `SceneSettings`.
- **Alternatives considered**:
  - *Yellow/green arcade glow*: Rejected; competes with the on cells.
  - *Border-only hint*: Weaker “whole line/column” read; a fill on empty cells matches “a linha ou coluna … com uma cor um pouco diferente.”
  - *Player-configurable color*: Out of spec (always-on, no toggle).

---

## 5. Observability

- **Decision**:
  - Grid: `data-lane-axis="row"|"col"` and `data-lane-index="{n}"` on `[data-testid="game-grid"]`.
  - Cell: existing `app-pixel` plus `data-lane="true"|"false"`.
  - Empty cells on the lane: `data-lit="false"`, `data-role="empty"`, `data-lane="true"`.
  - Snake/food on the lane: `data-lit="true"`, role unchanged, `data-lane="true"` (flag says “this cell is on the lane”; appearance still on).
- **Rationale**: E2E can assert “exactly one row/column” from axis+index, then spot-check `data-lane` without reading computed CSS. Matches the 001/003 contract style.
- **Alternatives considered**:
  - *CSS-only, no attributes*: Fragile in Playwright (`toHaveCSS` varies by engine).
  - *Lane attributes only on wrappers*: Less consistent with per-cell `data-row` / `data-col` / `data-role`.

---

## 6. Pause, wrap, restart

- **Decision**: Lane is a derived view. Pause skips `move*()` but does not clear head or `moveDirectionOld`, so the tint stays. Wrap already updates head coordinates; the getter follows. `start()` resets position and both direction fields to Forward, so the lane returns to row `0`.
- **Rationale**: Matches FR-007, FR-008, FR-009 without extra lane storage that could desync.
- **Alternatives considered**:
  - *Cached `this.lane` mutated in each move*: Easy to forget on `reverse()` / `start()`.
  - *Hide lane while paused*: Rejected; US3 wants the hint for planning.

---

## 7. Testing strategy

- **Decision**:
  - **Unit (Karma/Jasmine)**: `laneFor` / `cellIsOnLane` table. Scene after `start()`: axis `row`, index `0`. After a programmatic Down move: axis `col`, index = new head column. Pause leaves lane unchanged. `start()` after a vertical trip restores row `0`. Pixel: `data-lane` reflects the input; `.on` background stays black when `lane` is true.
  - **E2E (Playwright)**: New `e2e/lane.spec.ts` — opening `data-lane-axis="row"` / `data-lane-index="0"`; after steering Down and waiting one tick, axis becomes `col` and index matches the head column; pause keeps attributes; after `You lost!` + restart, row `0` again. Existing suites stay green.
- **Rationale**: The rule is a pure function; the player-visible contract is axis/index + `data-lane`. Timing-sensitive travel tests stay out of CI.
- **Alternatives considered**:
  - *Only screenshot diffs*: Brittle; attributes are enough for SC-002/SC-003.
  - *Fold cases into `rules.spec.ts`*: Keep that file about food/collision; lane gets its own spec.

---

## 8. Existing loop compatibility

- **Decision**: Do not change `setTimeout` recursion, reverse, wrap, food, or speed. Lane is computed on read during the same change-detection pass that already runs after each tick (`cdr.markForCheck()`).
- **Rationale**: The feature is appearance, not a new game rule. Touching the loop would risk pause/reverse/E2E regressions for no player value.

**Output**: All spec-deferred choices (paint method, applied vs queued direction, tint, ownership) are decided. No NEEDS CLARIFICATION remains.

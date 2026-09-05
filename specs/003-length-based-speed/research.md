# Technical Research: Length-Based Snake Speed

**Feature**: `003-length-based-speed`  
**Date**: 2026-09-04

This document resolves the planning decisions deferred from the spec: the speed curve, the playable cap, the on-screen indicator format, and where those rules live in the existing Angular scene.

---

## 1. Speed curve

- **Decision**: Linear interval reduction from snake length. After each growth, the next advance uses a shorter delay:

  `speedMs = max(minSpeed, initialSpeed - (length - initialLength) * speedStep)`

  Named helper: `SceneSettings.speedForLength(length)`.
- **Rationale**: The spec requires the same increase per segment (FR-004) until a cap (FR-005). A single named formula is readable (Constitution III) and lives next to the other game constants (Constitution IV). The existing loop already schedules the next tick with `setTimeout(..., this.speed)`, so updating `this.speed` during growth applies on the **next** advance — matching the spec edge case.
- **Alternatives considered**:
  - *Exponential decay* (`speed *= 0.9`): Rejected; the spec forbids non-linear steps.
  - *Speed-up every N foods*: Rejected; FR-003 ties the change to each grown segment.
  - *Separate timer service / RxJS interval*: Rejected; adds an engine abstraction (Constitution III) for a one-line delay change.

---

## 2. Numeric constants (playable cap)

- **Decision**: Keep the current start interval and add two central constants:

  | Setting | Value | Meaning |
  |---------|-------|---------|
  | `initialSpeed` | `200` | Existing start interval (ms). Unchanged. |
  | `speedStep` | `10` | Ms removed per grown segment. |
  | `minSpeed` | `100` | Fastest allowed interval (ms). Playable floor. |
  | `initialLength` | `4` | Current starting segment count, named so the formula has no magic number. |

  After 10 foods the interval reaches 100 ms and stays there. Five growths (SC-002) move 200 → 150 ms: 10 cells take 2000 ms vs 1500 ms — measurable without becoming twitchy.
- **Rationale**: Human choice reaction is ~200 ms, but snake input is anticipatory. 100 ms still leaves a visible cell-to-cell step and a window to press a direction between advances (FR-005, SC-006). 200 → 100 is a 2× cap, not an arcade blur. The step of 10 ms makes the first foods feel gradual instead of slamming into the cap.
- **Alternatives considered**:
  - *`minSpeed = 50` or `80`*: Rejected; too close to “impossible to play” for this study game.
  - *`speedStep = 20` (cap after 5 foods)*: Rejected; SC-002 only needs a measurable difference at 5 growths, not the cap. A longer ramp keeps mid-game playable.
  - *Leave numbers only as comments in `SceneComponent`*: Rejected; Constitution IV requires central settings.

---

## 3. When speed is applied and reset

- **Decision**:
  1. After a growth (food eaten), recompute `this.speed = SceneSettings.speedForLength(this.snakePosition.length)` before the recursive `move()` schedules the next timeout.
  2. `start()` MUST also assign `this.speed = SceneSettings.speedForLength(initialLength)` (today `start()` resets position but **not** speed — that is the bug FR-006 exists to close).
  3. Pause does not touch `this.speed`; the next timeout still uses the current value (FR-007).
- **Rationale**: Minimal change to the existing recursive `setTimeout` loop. No `clearTimeout` / restart-the-timer dance, which would apply the new pace mid-advance.
- **Alternatives considered**:
  - *Restart the timer immediately on eat*: Rejected; contradicts “new pace from the next advance.”
  - *Keep a long-lived `setInterval` and mutate the delay*: `setInterval` cannot change delay in place; would need teardown. Worse than the current pattern.

---

## 4. Speed indicator (HUD)

- **Decision**: A read-only label **outside** `[data-testid="game-grid"]`, next to the existing control buttons:

  - Visible text: `Speed: {level}` where `level = 1 + min(grown, maxGrown)` and `maxGrown = (initialSpeed - minSpeed) / speedStep` (1…11).
  - Observability: `data-testid="speed-indicator"`, `data-speed="{level}"`, `data-interval-ms="{speed}"`.
  - Not a button, input, or pixel-grid painting.
- **Rationale**: A rising level is readable (higher = faster). Raw milliseconds would show a *falling* number as the snake speeds up — confusing for a non-technical player. The extra `data-interval-ms` lets tests assert the real delay without parsing the label. Placing the HUD beside controls keeps Constitution I (the field stays on/off cells).
- **Alternatives considered**:
  - *Paint digits on the pixel grid*: Rejected; would invent a parallel glyph system and violate Constitution I.
  - *Show only milliseconds*: Rejected; counter-intuitive (smaller = faster).
  - *New `SpeedIndicatorComponent`*: Rejected; one bound label in `scene.component.html` is enough (Constitution III / V).

---

## 5. Architecture placement

- **Decision**: Extend `SceneSettings` with the constants + `speedForLength` / `speedLevelForLength`. Keep ownership of current `speed` and the indicator bindings on `SceneComponent`. Do not change `PixelComponent`.
- **Rationale**: Matches Constitution II (scene is the engine) and IV (central config). Unit tests can call the static helpers without mounting the full loop.
- **Alternatives considered**:
  - *Dedicated `SpeedService`*: Rejected as a generic engine abstraction for one formula.
  - *Hard-code the step inside each `move*()` method*: Rejected; four copies, easy to drift.

---

## 6. Testing strategy

- **Decision**:
  - **Unit (Karma/Jasmine)**: `speedForLength` / `speedLevelForLength` table (length 4 → 200/1, length 5 → 190/2, length 14 → 100/11, length 20 → 100/11). `start()` after a fake growth restores `speed === initialSpeed` and level 1. Indicator bindings render `data-speed` / `data-interval-ms`.
  - **E2E (Playwright)**: New assertions that `[data-testid="speed-indicator"]` is visible at level 1; after a successful eat, `data-speed` increases (or stays at 11 if already capped); after `You lost!` + restart, level is 1 again. Existing smoke/controls/rules suites stay green — they already poll with 3–4 s timeouts and assume only the **initial** 200 ms cadence.
- **Rationale**: Domain formula is easiest to prove in unit tests. The HUD and reset are player-visible and belong in E2E. Existing waits of 220 ms remain valid at the start of a game; after growth they simply observe *more* ticks, which current polls tolerate.
- **Alternatives considered**:
  - *Only E2E timing of 10-cell travel*: Fragile in CI; keep that as a manual/quickstart check (SC-002) and prove the formula in unit tests.
  - *Rewrite existing 220 ms sleeps to read `data-interval-ms`*: Nice-to-have, not required for this feature if new tests own the speed contract.

---

## 7. Existing loop compatibility

- **Decision**: Do not replace `setTimeout` recursion. Do not add requestAnimationFrame or a fixed 60 fps renderer.
- **Rationale**: Movement is already discrete ticks. The feature is “shorter delay between ticks,” not smoother interpolation. Changing the loop would risk pause, reverse, and E2E regressions for no player value.

**Output**: All spec-deferred choices (curve, cap numbers, indicator format) are decided. No NEEDS CLARIFICATION remains.

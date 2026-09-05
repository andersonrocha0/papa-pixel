# UI Observability Contract: Length-Based Speed

**Feature**: `003-length-based-speed`  
**Consumers**: Playwright E2E (`e2e/`), Karma scene specs  
**Provider**: `SceneComponent` template (HUD) + existing grid/controls

This contract **adds** the speed indicator. Grid, controls, and the `You lost!` dialog stay as defined in `specs/001-playwright-e2e-tests/contracts/ui-observability.md`.

---

## 1. Preserved (must not break)

| Selector | Meaning |
|----------|---------|
| `[data-testid="game-grid"]` | Pixel matrix root |
| `app-pixel[data-row][data-col][data-lit][data-role]` | Cell observability |
| `[data-testid="btn-pause"]` | Pause / resume |
| `[data-testid="btn-move-up\|down\|forward\|backward"]` | Direction |
| Keyboard arrows + Space | Unchanged |
| `window.alert` `"You lost!"` | Self-collision then restart |

Invariants from 001 still hold (1000 pixels, lit/role pairing, wrap, one food).

---

## 2. Speed indicator (new)

| Selector / attribute | Meaning |
|----------------------|---------|
| `[data-testid="speed-indicator"]` | Read-only HUD node, **sibling (or nearby ancestor sibling) of the grid — never a descendant of `game-grid`** |
| `[data-speed]` | Current speed level, stringified integer `"1"` … `"11"` |
| `[data-interval-ms]` | Current tick delay, stringified integer (start `"200"`, floor `"100"`) |
| Visible text | Contains the level, e.g. `Speed: 1` |

**Invariants**:

- Present on first paint after `ngOnInit` / `start()`.
- At session start: `data-speed="1"` and `data-interval-ms="200"`.
- After a growth that has not hit the cap: `data-speed` increases by 1 and `data-interval-ms` decreases by 10.
- At cap: further growth leaves both attributes unchanged (`data-speed="11"`, `data-interval-ms="100"`).
- While paused: node stays visible; attributes stay at the pre-pause values.
- After `You lost!` + restart: attributes return to start values.
- The indicator is not focusable as a control and does not change direction or pause.

---

## 3. Timing (for tests)

| Moment | Expected delay used by the loop |
|--------|----------------------------------|
| Fresh game, length 4 | 200 ms |
| Length 4 + N growths, N ≤ 10 | `200 - 10N` ms |
| Length ≥ 14 | 100 ms |

Tests that need the live delay SHOULD read `data-interval-ms` rather than hard-coding 200 after the snake has eaten.

Existing suites that only observe the opening seconds may keep assuming 200 ms.

---

## 4. Out of contract

- Exact CSS of the HUD (font, color) beyond being readable next to the buttons
- Internal property names (`this.speed`) except as reflected in the attributes above
- Painting speed digits onto `app-pixel` cells — forbidden

# UI Observability Contract: Destaque da Faixa de Navegação

**Feature**: `004-lane-highlight`  
**Consumers**: Playwright E2E (`e2e/`), Karma scene/pixel specs  
**Provider**: `SceneComponent` grid + `PixelComponent` hosts

This contract **adds** lane attributes. Grid, controls, `You lost!`, and the speed indicator stay as defined in `specs/001-playwright-e2e-tests/contracts/ui-observability.md` and `specs/003-length-based-speed/contracts/ui-observability.md`.

---

## 1. Preserved (must not break)

| Selector | Meaning |
|----------|---------|
| `[data-testid="game-grid"]` | Pixel matrix root |
| `app-pixel[data-row][data-col][data-lit][data-role]` | Cell observability |
| `[data-testid="speed-indicator"]` | Speed HUD (003) |
| `[data-testid="btn-pause"]` | Pause / resume |
| `[data-testid="btn-move-up\|down\|forward\|backward"]` | Direction |
| Keyboard arrows + Space | Unchanged |
| `window.alert` `"You lost!"` | Self-collision then restart |

Invariants from 001/003 still hold (1000 pixels, lit/role pairing, wrap, one food, speed HUD).

---

## 2. Lane on the grid (new)

| Selector / attribute | Meaning |
|----------------------|---------|
| `[data-testid="game-grid"][data-lane-axis]` | `"row"` while last applied travel is horizontal; `"col"` while vertical |
| `[data-testid="game-grid"][data-lane-index]` | Stringified integer: head row when axis is `row`, head column when axis is `col` |
| `app-pixel[data-lane]` | `"true"` if the cell is on that lane, otherwise `"false"` |

**Invariants**:

- Present on first paint after `ngOnInit` / `start()`.
- At session start: `data-lane-axis="row"` and `data-lane-index="0"` (head at `(0, 3)`, applied direction Forward).
- Count of `app-pixel[data-lane="true"]` is `columns` (50) when axis is `row`, or `lines` (20) when axis is `col` — never both (no 70-cell crosshair).
- Empty lane cells: `data-lit="false"`, `data-role="empty"`, `data-lane="true"`.
- Snake/food on the lane: `data-lit="true"`, `data-role` unchanged, `data-lane="true"`.
- Queuing a turn MUST NOT change axis/index until the next applied advance (or reverse) updates `moveDirectionOld` and the head.
- After an applied vertical advance: `data-lane-axis="col"` and `data-lane-index` equals the new head column; no leftover full-row of `data-lane="true"` on the previous row.
- After wrap: `data-lane-index` equals the wrapped head row or column.
- While paused: attributes stay at the pre-pause values; the tint remains visible.
- After `You lost!` + restart: attributes return to `row` / `0`.
- No control exists to disable the lane.

---

## 3. Appearance (for visual / unit checks)

| State | Empty cell background |
|-------|------------------------|
| `data-lane="false"` and `data-lit="false"` | White (`#ffffff` / `white`) |
| `data-lane="true"` and `data-lit="false"` | Subtle tint `#e8edf4` |
| `data-lit="true"` | Black, regardless of `data-lane` |

Tests SHOULD prefer attributes over computed CSS except when asserting that `.on` is not replaced by the tint.

---

## 4. Out of contract

- Exact pixel border color
- Internal property names (`moveDirectionOld`, `activeLane`) except as reflected in the attributes above
- Overlay/canvas/SVG lane drawing — forbidden

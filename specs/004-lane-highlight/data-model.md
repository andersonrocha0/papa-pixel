# Data Model: Destaque da Faixa de Navegação

**Feature**: `004-lane-highlight`  
**Date**: 2026-09-04

Entities below extend the existing in-memory scene model. No persistence. Types are conceptual; field names may match `SceneComponent` / `SceneSettings` / `PixelComponent`.

---

## 1. Entities

### 1.1 ActiveLane

| Field | Type | Meaning |
|-------|------|---------|
| `axis` | `'row'` \| `'col'` | Line (horizontal travel) or column (vertical travel). Never both. |
| `index` | number | Zero-based row when `axis === 'row'`, or column when `axis === 'col'`. |

**Helpers (pure, `SceneSettings`)**:

- `laneFor(head, axis)` → `{ axis, index: axis === 'row' ? head.i : head.j }`
- `cellIsOnLane(row, col, lane)` → `lane.axis === 'row' ? row === lane.index : col === lane.index`

**Validation**:

- `axis` is exactly one of `row` / `col` (no `'both'`, no `null` during a match).
- `index` is an integer in range: `[0, lines)` for `row`, `[0, columns)` for `col`.
- Exactly one `ActiveLane` exists at any moment of a match (including pause and the frame after `start()`).

### 1.2 Snake head + applied direction

| Field | Meaning |
|-------|---------|
| `head` | Last cell of `snakePosition` (`{ i, j }`). |
| `moveDirectionOld` | Last *applied* direction (`Up` / `Down` / `Forward` / `Backward`). |

**Mapping**:

| `moveDirectionOld` | `ActiveLane.axis` | `ActiveLane.index` |
|--------------------|-------------------|--------------------|
| Forward, Backward | `row` | `head.i` |
| Up, Down | `col` | `head.j` |

**Validation**:

- Queued `moveDirection` MUST NOT change `ActiveLane` until a tick applies it (or `reverse()` copies it into `moveDirectionOld`).
- After wrap, `head` is on the opposite edge; `index` follows that new `i` or `j`.
- Body segments off the head’s lane do not create extra `ActiveLane`s.

### 1.3 Pixel (presentational)

| Field | Type | Meaning |
|-------|------|---------|
| `on` | boolean | Lit (snake/food) vs empty. Unchanged. |
| `role` | `'empty'` \| `'snake'` \| `'food'` | Unchanged. |
| `lane` | boolean | Cell sits on `ActiveLane`. |

**Appearance rules**:

| `on` | `lane` | Player-facing look |
|------|--------|--------------------|
| false | false | Plain empty (white) |
| false | true | Empty on the lane (subtle tint `#e8edf4`) |
| true | * | Snake or food (black); tint MUST NOT replace “on” |

**Validation**:

- `lane === true` AND `on === false` ⇒ empty highlighted cell.
- `lane === true` AND `on === true` ⇒ still snake/food (`role` unchanged).
- At most one full row *or* one full column of `lane === true` (1000 cells: 50 or 20 flagged, never 70 as a crosshair).

### 1.4 Grid projection

| Attribute | Meaning |
|-----------|---------|
| `data-lane-axis` | `activeLane.axis` |
| `data-lane-index` | Stringified `activeLane.index` |
| `app-pixel[data-lane]` | Per-cell `lane` flag |

These are projections of `ActiveLane`, not a second source of truth.

### 1.5 Food, pace, session

Unchanged from `003-length-based-speed` except:

- **Game session `start()`** restores head `(0, 3)`, both directions to Forward, and therefore `ActiveLane` to `{ axis: 'row', index: 0 }`.
- Pause does not mutate head, `moveDirectionOld`, or `ActiveLane`.

---

## 2. Lifecycle

```text
start()
  head = (0, 3)
  moveDirection = Forward
  moveDirectionOld = Forward
  ActiveLane = { axis: row, index: 0 }   # derived, already visible
  unpause
      |
      v
  tick
      |-- paused? skip move; ActiveLane unchanged
      |-- apply moveDirection (advance / reverse / wrap / eat)
      |-- moveDirectionOld = moveDirection
      |-- ActiveLane = laneFor(newHead, axis(moveDirectionOld))
      |-- self-collision? alert → start()
      +-- schedule next tick
```

### Transitions

| From | Event | To |
|------|--------|----|
| Row `i`, heading Forward/Backward | Advance on same row | Same `{ row, i }` |
| Row `i`, heading Forward/Backward | Tick applies Up/Down | `{ col, newHead.j }` |
| Col `j`, heading Up/Down | Advance on same column | Same `{ col, j }` |
| Col `j`, heading Up/Down | Tick applies Forward/Backward | `{ row, newHead.i }` |
| Any | Wrap | Same axis; `index` = wrapped head coordinate |
| Any | Pause / resume | Same `ActiveLane` |
| Any | `start()` / after “You lost!” | `{ row, 0 }` |

---

## 3. Relationships

- **head + moveDirectionOld** → **axis** → **SceneSettings.laneFor** → **ActiveLane**.
- **ActiveLane** → **cellIsOnLane** → **Pixel.lane** → `data-lane` and off-cell tint.
- **ActiveLane** → grid `data-lane-axis` / `data-lane-index`.
- **Pixel.on / role** remain owned by snake/food painting; `lane` never turns a cell on.

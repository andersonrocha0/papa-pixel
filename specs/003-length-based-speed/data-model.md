# Data Model: Length-Based Snake Speed

**Feature**: `003-length-based-speed`  
**Date**: 2026-09-04

Entities below extend the existing in-memory scene model. No persistence. Types are conceptual; field names may match `SceneComponent` / `SceneSettings`.

---

## 1. Entities

### 1.1 SceneSettings (central config)

| Field | Type | Value | Rule |
|-------|------|-------|------|
| `lines` | number | 20 | Unchanged |
| `columns` | number | 50 | Unchanged |
| `initialSpeed` | number (ms) | 200 | Interval at start length |
| `speedStep` | number (ms) | 10 | Subtracted per grown segment |
| `minSpeed` | number (ms) | 100 | Fastest allowed interval |
| `initialLength` | number | 4 | Starting segment count |

**Helpers (pure)**:

- `speedForLength(length)` → `max(minSpeed, initialSpeed - max(0, length - initialLength) * speedStep)`
- `speedLevelForLength(length)` → `1 + min(grown, (initialSpeed - minSpeed) / speedStep)`

**Validation**:

- `minSpeed > 0` and `minSpeed <= initialSpeed`
- `speedStep > 0`
- `length < initialLength` is treated as start length (no negative grown)

### 1.2 Snake

| Field | Meaning |
|-------|---------|
| `segments` | Ordered cells; last is head. Length is the speed input. |
| `currentDirection` / `previousDirection` | Unchanged |

**Validation**:

- Start length is `SceneSettings.initialLength` (4 cells at `(0,0)…(0,3)`).
- Length increases by 1 only when the head occupies food.
- Length never decreases during a session.

### 1.3 Movement pace (speed)

| Field | Meaning |
|-------|---------|
| `speed` | Current timeout delay in ms. Derived from snake length via `speedForLength`. |
| `speedLevel` | Player-facing integer (1…11). Derived via `speedLevelForLength`. |

**Invariants**:

- At `length === initialLength`, `speed === initialSpeed` and `speedLevel === 1`.
- Each growth below the cap: `speed` decreases by `speedStep`, `speedLevel` increases by 1.
- At or above the cap length (`initialLength + 10`): `speed === minSpeed`, `speedLevel === 11`.
- Pause does not change `speed` or `speedLevel`.

### 1.4 Speed indicator (HUD)

| Field / attribute | Meaning |
|-------------------|---------|
| Visible label | `Speed: {speedLevel}` |
| `data-testid` | `speed-indicator` |
| `data-speed` | Stringified `speedLevel` |
| `data-interval-ms` | Stringified `speed` |

**Validation**:

- Always present while the scene is shown (including pause).
- Not inside `game-grid`; not a control.
- Value changes only when `speed` / `speedLevel` change (growth below cap, or `start()`).

### 1.5 Food, Grid, Game session

Unchanged from the current game except:

- **Game session `start()`** restores snake length, direction, food, **and** `speed` / `speedLevel` to the initial settings.
- Food eat → grow → recompute pace → paint new food (order: growth first, then formula, then next tick uses new `speed`).

---

## 2. Lifecycle

```text
start()
  length = initialLength
  speed = initialSpeed          # MUST reset (new)
  speedLevel = 1                # MUST reset (new)
  unpause
      |
      v
  tick (setTimeout(speed))
      |-- paused? skip move, still reschedule with same speed
      |-- move head
      |-- ate food?
      |     grow length
      |     speed = speedForLength(length)
      |     speedLevel = speedLevelForLength(length)
      |     spawn food
      |-- self-collision? alert → start()
      +-- schedule next tick with current speed
```

### Transitions

| From | Event | To |
|------|--------|----|
| Running, length N, speed S | Eat (N < cap length) | length N+1, speed S−10, level +1 |
| Running, length ≥ 14, speed 100 | Eat | length +1, speed 100, level 11 |
| Running | Pause / resume | Same speed and level |
| Any | `start()` / after “You lost!” | length 4, speed 200, level 1 |

---

## 3. Relationships

- **Snake.length** → **SceneSettings.speedForLength** → **speed** → next `setTimeout` and `data-interval-ms`.
- **Snake.length** → **SceneSettings.speedLevelForLength** → **speedLevel** → label and `data-speed`.
- **Indicator** is a projection of pace, not a source of truth.

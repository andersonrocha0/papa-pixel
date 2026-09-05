# Data Model & Domain Entities: Angular Modernization

**Feature**: Upgrade to Latest Stable Angular Version  
**Feature Directory**: `specs/002-upgrade-angular`  
**Date**: 2026-09-04  

This document details the domain entities, state structures, and runtime data transitions within the PapaPixel application, ensuring that the modernization to Angular 22 preserves all data contracts and state integrity.

---

## 1. Core Domain Entities

### 1.1 Pixel Cell (`Pixel`)
Represents an individual discrete element on the rectangular display matrix.
- **Attributes**:
  - `row: number` — Zero-indexed vertical row coordinate (\(0 \le \text{row} < 20\)).
  - `col: number` — Zero-indexed horizontal column coordinate (\(0 \le \text{col} < 50\)).
  - `on: boolean` — Active illumination state (`true` if illuminated, `false` otherwise).
  - `role: 'empty' | 'snake' | 'food'` — Semantic classification of the cell content.
- **Constraints**:
  - Purely presentational; holds no state logic or update timers.
  - Expresses attributes directly on the DOM via `data-row`, `data-col`, `data-lit`, and `data-role` for observability.

### 1.2 Grid Matrix (`SceneGrid`)
Represents the 20-row by 50-column rectangular canvas.
- **Attributes**:
  - `lines: Array<any>` — Array of length 20 defining rows.
  - `columns: Array<any>` — Array of length 50 defining columns.
  - `onOffController: boolean[][]` — 2D matrix storing illumination boolean for every coordinate `[i][j]`.
  - `roleController: ('empty' | 'snake' | 'food')[][]` — 2D matrix storing semantic occupancy for every coordinate `[i][j]`.
- **Validation Rules**:
  - Dimensions MUST adhere to `SceneSettings.lines` (20) and `SceneSettings.columns` (50).
  - At any game tick, the grid MUST faithfully reflect the positions of the Snake and Food entities.

### 1.3 Snake Entity (`Snake`)
Represents the player-controlled moving organism.
- **Attributes**:
  - `segments: Array<{ i: number, j: number }>` — Ordered collection of coordinates where the last element is the head (`head = segments[segments.length - 1]`) and index 0 is the tail.
  - `currentDirection: Direction` — Active movement trajectory (`Up`, `Down`, `Forward`, `Backward`).
  - `previousDirection: Direction` — Direction during the previous tick, used to prevent immediate 180-degree self-reversals.
- **Validation Rules**:
  - Initial snake size is 4 segments at row 0: `(0,0)`, `(0,1)`, `(0,2)`, `(0,3)`.
  - When the head position overlaps with any body segment coordinate, self-collision occurs.

### 1.4 Food Entity (`Food`)
Represents the consumable item that induces snake growth.
- **Attributes**:
  - `position: { i: number, j: number }` — Coordinate located within \([0, 19]\) for `i` and \([0, 49]\) for `j`.
- **Validation Rules**:
  - Exactly one food item exists on the grid at any active moment.
  - Food MUST spawn randomly upon consumption.

### 1.5 Game Session State (`GameState`)
Represents the lifecycle and configuration of the active gameplay session.
- **Attributes**:
  - `isPaused: boolean` — Whether the tick timer loop is suspended (`true`) or executing (`false`).
  - `speed: number` — Tick interval in milliseconds (defaults to `SceneSettings.initialSpeed`).
  - `isGameOver: boolean` — Flag or prompt triggered when self-collision or unhandled boundary occurs.
  - `score: number` — Inferred from the number of consumed food items (`segments.length - initialLength`).

---

## 2. State Transitions & Game Lifecycle

```text
       +------------------+
       |   Application    |
       |     Startup      |
       +--------+---------+
                |
                v
       +------------------+
+----->|   Game Started   |<----------------+
|      | (Running State)  |                 |
|      +--------+---------+                 |
|               |                           |
|       +-------+-------+                   |
|       |               |                   |
|       v               v                   |
|  [Direction       [Timer Tick]            |
|    Changed]           |                   |
|       |               v                   |
|       |        [Check Head Next]          |
|       |          /         \              |
|       |     (Food)        (Normal)        |
|       |       /               \           |
|       | [Grow Snake]      [Shift Body]    |
|       | [Spawn Food]           |          |
|       |       \               /           |
|       |        v             v            |
|       |       [Paint Grid Cells]          |
|       |               |                   |
|       +---------------+                   |
|               |                           |
|      +--------+--------+                  |
|      |                 |                  |
|      v                 v                  |
|  [Pause Event]  [Collision Event]         |
|      |                 |                  |
|      v                 v                  |
|  +-------+       +-----------+            |
|  | Paused|       | Game Over |            |
|  | State |       |   Alert   |            |
|  +---+---+       +-----+-----+            |
|      |                 |                  |
| [Resume]               +--- [Restart] ----+
+------+
```

### 2.1 State Transition Triggers

1. **Start / Reset**:
   - `SceneComponent.start()` resets snake position to initial 4 cells, clears controllers, generates random food, paints grid, and unpauses.
2. **Direction Input**:
   - Keyboard arrow keys or on-screen directional buttons invoke `changeDirection(direction)`.
   - Update takes effect on subsequent tick. If reversing 180 degrees directly, `reverse()` manages head-to-tail inversion.
3. **Timer Tick (`move()`)**:
   - Scheduled recursively via `setTimeout(..., this.speed)`.
   - If not paused, calculates `nextPosition` based on current direction.
   - If head matches food coordinate: appends new segment, spawns new food, preserves tail.
   - If head does not match food: removes old tail, pushes new head.
   - Checks for duplicate coordinates (self-collision). If detected, triggers game pause, alerts loss, and resets session.
4. **Pause / Unpause**:
   - Triggered by Spacebar keypress or clicking `btn-pause`.
   - Toggles `isPaused` flag, halting movement iterations while preserving all coordinate matrices.

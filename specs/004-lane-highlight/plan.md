# Implementation Plan: Destaque da Faixa de Navegação

**Branch**: `004-lane-highlight` | **Date**: 2026-09-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-lane-highlight/spec.md`

## Summary

Tint the empty cells of the snake head’s current travel lane so the player can see alignment at a glance. Horizontal travel highlights the head’s full row; vertical travel highlights the head’s full column. Scene derives a named `ActiveLane` from the last *applied* direction and the current head, then passes a presentational `[lane]` flag into each `PixelComponent`. Occupied cells stay on (snake/food); only empty cells get a subtle off-color. No toggle, no crosshair, no new packages.

## Technical Context

**Language/Version**: TypeScript ~6.0.3, targeting ES2022 on Node.js 24

**Primary Dependencies**: Angular 22.1.5 (`@angular/core` and existing scene/pixel modules), RxJS ^7.8.2, Zone.js ~0.16.3 — no new packages

**Storage**: N/A (in-memory game state only)

**Testing**: Jasmine/Karma unit tests (`scene.settings.spec.ts`, `scene.component.spec.ts`, `pixel.component.spec.ts`); Playwright E2E (`e2e/`) against `http://localhost:4200`

**Target Platform**: Desktop evergreen browsers (Chrome, Edge, Firefox)

**Project Type**: Client-side Angular SPA

**Performance Goals**: Lane recompute is O(1) per tick (head + direction → one axis + index). Binding `[lane]` on 1000 cells stays inside the existing change-detection pass; no extra animation loop.

**Constraints**:
- PapaPixel Constitution v1.0.0 (pixel grid, Scene × Pixel, study clarity, central settings, educational SPA)
- Highlight lives on grid cells; no canvas/sprites/SVG overlay
- Pixel stays presentational; Scene owns head, direction, and lane derivation
- Zero regressions in existing smoke / controls / rules / speed E2E and scene unit tests
- Preserve current wrap, pause, reverse, food, self-collision, and length-based speed

**Scale/Scope**: Two named helpers in settings, one presentational input on Pixel, scene template bindings, unit + one E2E spec; no new components or services

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

PapaPixel Constitution v1.0.0 — all items MUST pass (or be justified in Complexity Tracking):

- [x] **I. Pixel grid**: The field stays a rectangular matrix of cells. The new look is a second appearance of *off* cells (plain vs lane tint), not a parallel render path. Snake and food remain on.
- [x] **II. Scene × Pixel**: `PixelComponent` only receives `[lane]` and paints it (same role as `[on]` / `[role]`). Head, last applied direction, and `ActiveLane` live on `SceneComponent` + `SceneSettings`.
- [x] **III. Study clarity**: One named pair (`laneFor` / `cellIsOnLane`); no lane service, store, or engine abstraction.
- [x] **IV. Central config & explicit rules**: Axis/index rules sit next to the other game parameters in `SceneSettings`. Tint token can live in pixel CSS (presentation, not a game rule).
- [x] **V. Educational scope**: Still a client-side Angular SPA; no backend, auth, or new dependencies.
- [x] **Playable increment**: A playable snake whose current row or column is visibly hinted, follows the head after each advance/turn/wrap, survives pause, and resets on a new game.

*Post-design re-check*: Same gates still pass. Design adds only settings helpers, scene getters/bindings, a presentational pixel input + `data-lane`, and tests. Complexity Tracking remains empty.

## Project Structure

### Documentation (this feature)

```text
specs/004-lane-highlight/
├── spec.md
├── checklists/
│   └── requirements.md
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── contracts/
│   └── ui-observability.md
├── quickstart.md        # Phase 1
└── tasks.md             # Phase 2 — /speckit-tasks (not created here)
```

### Source Code (repository root)

```text
src/app/scene/
├── scene.settings.ts       # Add LaneAxis, ActiveLane, laneFor, cellIsOnLane
├── scene.settings.spec.ts  # Table of head + axis → lane
├── scene.component.ts      # Derive activeLane from head + moveDirectionOld
├── scene.component.html    # [lane], data-lane-axis, data-lane-index
└── scene.component.spec.ts # Start row, turn→column, pause, restart

src/app/pixel/
├── pixel.component.ts      # [lane] input + HostBinding data-lane
├── pixel.component.html    # Unchanged (on/off classes)
├── pixel.component.css     # Subtle .off tint when host[data-lane="true"]
└── pixel.component.spec.ts # data-lane and off-vs-on appearance

e2e/
├── helpers/grid.ts         # Optional: read data-lane-axis / data-lane-index
├── smoke.spec.ts           # Must still pass
├── controls.spec.ts        # Must still pass
├── rules.spec.ts           # Must still pass
├── speed.spec.ts           # Must still pass
└── lane.spec.ts            # New: axis/index, turn, pause, restart
```

**Structure Decision**: Stay on the single Angular SPA. Touch scene settings/component, pixel presentational API, and tests. Do not add services, overlays, or a new feature module.

## Complexity Tracking

> **No Constitution violations.**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None*    | N/A        | N/A                                 |

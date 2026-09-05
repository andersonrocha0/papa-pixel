# Implementation Plan: Length-Based Snake Speed

**Branch**: `003-length-based-speed` | **Date**: 2026-09-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-length-based-speed/spec.md`

## Summary

Make the snake advance faster as it grows, without ever becoming unplayable, and show the current speed on screen. Interval is derived from length with a named formula in `SceneSettings` (`200 ms` start, `−10 ms` per extra segment, floor `100 ms`). `SceneComponent` applies that delay on the next tick, resets it in `start()`, and binds a read-only HUD (`data-testid="speed-indicator"`) beside the existing controls — never on the pixel grid.

## Technical Context

**Language/Version**: TypeScript ~6.0.3, targeting ES2022 on Node.js 24

**Primary Dependencies**: Angular 22.1.5 (`@angular/core` and existing scene/pixel modules), RxJS ^7.8.2, Zone.js ~0.16.3 — no new packages

**Storage**: N/A (in-memory game state only)

**Testing**: Jasmine/Karma unit tests (`scene.component.spec.ts`, settings helpers); Playwright E2E (`e2e/`) against `http://localhost:4200`

**Target Platform**: Desktop evergreen browsers (Chrome, Edge, Firefox)

**Project Type**: Client-side Angular SPA

**Performance Goals**: Discrete ticks remain the movement model; fastest tick is 100 ms so each cell step stays visible and a direction change fits between advances

**Constraints**:
- PapaPixel Constitution v1.0.0 (pixel grid, Scene × Pixel, study clarity, central settings, educational SPA)
- HUD is outside `[data-testid="game-grid"]`
- Zero regressions in existing smoke / controls / rules E2E and scene unit tests
- Preserve current wrap, pause, reverse, food, and self-collision rules

**Scale/Scope**: One settings module, one scene template/class, existing unit + E2E suites; no new components or services

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

PapaPixel Constitution v1.0.0 — all items MUST pass (or be justified in Complexity Tracking):

- [x] **I. Pixel grid**: Field visuals stay on/off cells. Speed HUD is HTML next to controls, not canvas/sprites/SVG entities or digits painted on `app-pixel`.
- [x] **II. Scene × Pixel**: `PixelComponent` unchanged. Length → speed formula, timeout delay, and indicator bindings live on `SceneComponent` + `SceneSettings`.
- [x] **III. Study clarity**: One named formula (`speedForLength` / `speedLevelForLength`); no timer service, store, or generic engine.
- [x] **IV. Central config & explicit rules**: `initialSpeed`, `speedStep`, `minSpeed`, `initialLength` and the helpers sit in `SceneSettings`. Growth still triggers a named recompute, not a magic literal in each `move*()`.
- [x] **V. Educational scope**: Still a client-side Angular SPA; no backend, auth, or new dependencies.
- [x] **Playable increment**: A playable snake that visibly accelerates, caps at 100 ms, resets on new game, and shows `Speed: N`.

*Post-design re-check*: Same gates still pass. Design adds only settings helpers, scene state reset, and one HUD node. Complexity Tracking remains empty.

## Project Structure

### Documentation (this feature)

```text
specs/003-length-based-speed/
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
├── scene.settings.ts       # Add speedStep, minSpeed, initialLength, speedForLength, speedLevelForLength
├── scene.component.ts      # Recompute speed on grow; reset speed in start(); expose speedLevel
├── scene.component.html    # Read-only speed indicator next to controls
├── scene.component.css     # Minimal HUD placement if needed
└── scene.component.spec.ts # Formula, reset, indicator bindings

e2e/
├── helpers/grid.ts         # Unchanged (optional: read speed indicator)
├── smoke.spec.ts           # Must still pass at 200 ms open
├── controls.spec.ts        # Must still pass
├── rules.spec.ts           # Must still pass; add eat → indicator / reset cases as needed
└── (optional new spec)     # Speed HUD + cap + reset if keeping rules.spec focused
```

**Structure Decision**: Stay on the single Angular SPA. Touch only the scene settings/component and tests. Do not add services, new feature modules, or pixel-layer changes.

## Complexity Tracking

> **No Constitution violations.**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None*    | N/A        | N/A                                 |

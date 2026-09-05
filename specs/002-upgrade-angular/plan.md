# Implementation Plan: Upgrade to Latest Stable Angular Version

**Branch**: `002-upgrade-angular` | **Date**: 2026-09-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-upgrade-angular/spec.md`

## Summary

Modernize the PapaPixel retro snake game application from legacy Angular 13.3.9 to the latest stable official release, **Angular 22.1.5**, along with compatible TypeScript (`~6.0.3`), RxJS (`^7.8.2`), Zone.js (`~0.16.3`), and modernized CLI builder configurations. The upgrade resolves Node.js 24 runtime incompatibility warnings, preserves 100% of the pixel-grid DOM and UI observability contracts, and ensures complete continuity across both Karma unit tests and Playwright end-to-end integration tests without altering core gameplay semantics.

## Technical Context

**Language/Version**: TypeScript ~6.0.3, targeting ES2022 on Node.js v24.16.0

**Primary Dependencies**:
- `@angular/core`, `@angular/common`, `@angular/compiler`, `@angular/platform-browser`, `@angular/platform-browser-dynamic`, `@angular/router`, `@angular/forms`, `@angular/animations`: `22.1.5`
- `rxjs`: `^7.8.2`
- `zone.js`: `~0.16.3`
- `tslib`: `^2.8.1`
- `@angular/cli`, `@angular-devkit/build-angular`, `@angular/compiler-cli`: `22.1.5`

**Storage**: N/A (pure client-side in-memory game state)

**Testing**:
- Unit testing: Jasmine (`jasmine-core@^5.1.2`, `@types/jasmine@~5.1.4`) + Karma (`karma@^6.4.4`, `karma-jasmine@^5.1.0`, `karma-chrome-launcher@^3.2.0`, `karma-coverage@^2.2.1`)
- End-to-End testing: Playwright (`@playwright/test@^1.63.0`) against `http://localhost:4200`

**Target Platform**: Modern desktop evergreen browsers (Chrome, Edge, Firefox)

**Project Type**: Client-side Angular Single-Page Application (SPA)

**Performance Goals**:
- Local development server start in under 2 seconds
- Production build compilation and bundling in under 60 seconds
- Steady 60fps tick rendering without UI lag or memory leaks

**Constraints**:
- Strict adherence to PapaPixel Constitution v1.0.0
- Zero regressions in existing Playwright tests (`smoke.spec.ts`, `controls.spec.ts`, `rules.spec.ts`)
- Zero regressions in existing unit tests (`app.component.spec.ts`, `pixel.component.spec.ts`, `scene.component.spec.ts`)
- Preserved DOM contract: `[data-testid="game-grid"]`, `app-pixel[data-row][data-col][data-lit][data-role]`, control button IDs

**Scale/Scope**: Single application repository, 1 scene container, 1 pixel component, 1 settings module, 3 test suites

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

PapaPixel Constitution v1.0.0 — all items MUST pass (or be justified in Complexity Tracking):

- [x] **I. Pixel grid**: Game visuals are expressed as on/off cells on the 20x50 rectangular grid; no parallel render path (canvas/sprites/SVG) introduced.
- [x] **II. Scene × Pixel**: `PixelComponent` stays strictly presentational (`[on]`, `[row]`, `[col]`, `[role]`); game loop, state, collision, food, and input live in `SceneComponent`.
- [x] **III. Study clarity**: Code remains clean, explicit, and educational; no premature optimization, complex state stores, or generic engine abstractions added.
- [x] **IV. Central config & explicit rules**: Grid dimensions (20x50), speed, and step rules reside centrally in `SceneSettings`.
- [x] **V. Educational scope**: Remains a pure Angular client-side SPA; no backend, auth, remote databases, or external dependencies added.
- [x] **Playable increment**: The result is a fully functional, playable snake game running on the modernized Angular 22 runtime.

## Project Structure

### Documentation (this feature)

```text
specs/002-upgrade-angular/
├── spec.md              # Feature specification
├── checklists/
│   └── requirements.md  # Quality validation checklist
├── plan.md              # Implementation plan (this file)
├── research.md          # Technical research & decisions (Phase 0)
├── data-model.md        # Domain entities & state lifecycle (Phase 1)
├── contracts/
│   └── ui-observability.md # UI observability & DOM contract (Phase 1)
├── quickstart.md        # End-to-end run & validation guide (Phase 1)
└── tasks.md             # Task breakdown (Phase 2 - via /speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── app-routing.module.ts       # Application routing
│   ├── app.component.css           # Shell styling
│   ├── app.component.html          # Shell template (<app-scene></app-scene>)
│   ├── app.component.spec.ts       # Root component unit tests
│   ├── app.component.ts            # Root component definition
│   ├── app.module.ts               # Root Angular module
│   ├── pixel/
│   │   ├── pixel.component.css     # Pixel on/off styles
│   │   ├── pixel.component.html    # Pixel DOM template
│   │   ├── pixel.component.spec.ts # Pixel unit tests
│   │   └── pixel.component.ts      # Pure presentational pixel component
│   └── scene/
│       ├── scene.component.css     # Grid layout styling
│       ├── scene.component.html    # 20x50 matrix and control buttons
│       ├── scene.component.spec.ts # Scene unit tests
│       ├── scene.component.ts      # Game engine, loop, food, collision logic
│       └── scene.settings.ts       # Centralized settings (lines, columns, speed)
├── environments/
│   ├── environment.prod.ts         # Production environment flags
│   └── environment.ts              # Development environment flags
├── favicon.ico                     # Favicon
├── index.html                      # Entry HTML host
├── main.ts                         # Application bootstrap
├── polyfills.ts                    # Zone.js and browser polyfills
├── styles.css                      # Global retro LCD styles
└── test.ts                         # Karma test entry point

e2e/
├── helpers/
│   └── grid.ts                     # Playwright grid query helpers
├── controls.spec.ts                # E2E directional and pause control tests
├── rules.spec.ts                   # E2E collision, growth, and food tests
└── smoke.spec.ts                   # E2E grid and render smoke tests

angular.json                        # Angular workspace and build configurations
karma.conf.js                       # Karma test runner configuration
package.json                        # Package dependencies & scripts
playwright.config.ts                # Playwright configuration
tsconfig.app.json                  # Application TypeScript configuration
tsconfig.json                      # Workspace TypeScript root configuration
tsconfig.spec.json                 # Testing TypeScript configuration
```

**Structure Decision**: Preserves the single-project Angular SPA architecture. Configuration files at root (`angular.json`, `tsconfig.json`, `package.json`) are reconciled for Angular 22; source components in `src/app/` retain clean separation of concerns without introducing unnecessary abstractions.

## Complexity Tracking

> **No Constitution violations detected.**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None*    | N/A        | N/A                                 |

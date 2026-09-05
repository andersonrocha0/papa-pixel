# Technical Research & Architecture Decisions: Upgrade to Latest Stable Angular

**Feature**: Upgrade to Latest Stable Angular Version  
**Feature Directory**: `specs/002-upgrade-angular`  
**Date**: 2026-09-04  

This document captures all research findings, technology choices, version alignments, and upgrade strategies required to modernize the PapaPixel application from legacy Angular 13.3.9 to the latest stable release while ensuring zero regressions in gameplay, testing, or build integrity.

---

## 1. Target Framework & Version Selection

- **Decision**: Upgrade directly to **Angular 22.1.5** (latest official stable release tagged `latest` in npm registry).
- **Rationale**:
  - `npm view @angular/core dist-tags` shows `latest: '22.1.5'` and `next: '22.2.0-next.5'`. Angular 22 is the active stable LTS release line.
  - Angular 22 is specifically designed to run on modern Node.js versions (`^22.22.3 || ^24.15.0 || >=26.0.0`). The current host machine runs Node `v24.16.0`, which perfectly satisfies this engine constraint without requiring runtime version switching or downgrading.
  - Upgrading to the latest stable version eliminates all Node version mismatch warnings, provides modern build optimizations, and closes historical security advisories present in Angular 13 dependencies.
- **Alternatives Considered**:
  - *Angular 22.2.0-next.5 (`next` dist-tag)*: Rejected because the user specifically requested "mais recente e mais estável" (most recent and most stable); pre-release/next versions may introduce breaking instability.
  - *Angular 17 / 18 / 19 / 20 / 21 LTS*: Rejected because they are older intermediate releases and would not fulfill the requirement of updating to the most recent stable release.
  - *Remaining on Angular 13.3.9*: Rejected because Angular 13 is end-of-life and unsupported on the system's Node.js 24 environment (`Warning: The current version of Node (24.16.0) is not supported by Angular`).

---

## 2. Dependency Matrix & Peer Version Reconciliation

- **Decision**: Align all primary dependencies and devDependencies to their corresponding Angular 22.1.5 supported peer versions:
  - `@angular/*` (animations, common, compiler, compiler-cli, core, forms, platform-browser, platform-browser-dynamic, router): `22.1.5`
  - `@angular-devkit/build-angular` / `@angular/cli`: `22.1.5`
  - `typescript`: `~6.0.3` (satisfies `@angular/compiler-cli@22.1.5` peer constraint `typescript: '>=6.0 <6.1'`)
  - `rxjs`: `^7.8.2` (supported by `@angular/core@22.1.5` peer constraint `rxjs: '^6.5.3 || ^7.4.0'`, provides standard modern RxJS semantics)
  - `zone.js`: `~0.16.3` (satisfies peer constraint `zone.js: '~0.15.0 || ~0.16.0'`)
  - `tslib`: `^2.8.1` (satisfies peer constraint `tslib: '^2.3.0'`)
  - Testing suite: `karma@^6.4.4`, `karma-jasmine@^5.1.0`, `karma-chrome-launcher@^3.2.0`, `karma-coverage@^2.2.1`, `jasmine-core@^5.1.2`, `@types/jasmine@~5.1.4` (or `~6.0.0`), `@types/node@^24.0.0`
  - `@playwright/test`: Preserved at `^1.63.0` (independent runner verified for end-to-end regression testing)
- **Rationale**:
  - Directly resolving the peer dependency graph prevents installation collisions and avoids relying on `--force` or `--legacy-peer-deps` during CI/CD or local builds.
- **Alternatives Considered**:
  - *Running step-by-step `ng update` through 9 major versions (13 -> 14 -> ... -> 22)*: Rejected because intermediate CLI versions fail to run under Node 24 (which is required by the current environment), and the PapaPixel codebase is a concise, focused educational SPA that can be cleanly upgraded at once without complex intermediate database or routing migration scripts.

---

## 3. Configuration & Builder Modernization (`angular.json` & `tsconfig.json`)

- **Decision**: Modernize workspace configuration files to align with Angular 22 standards:
  1. In `angular.json`:
     - Remove obsolete root-level property `"defaultProject": "papa-pixel"` (which causes Angular 22 CLI schema validation errors).
     - In `architect.serve`: update target reference from `"browserTarget"` to `"buildTarget"` (`papa-pixel:build:development` / `production`).
     - In `architect.extract-i18n`: update `"browserTarget"` to `"buildTarget"`.
     - In `architect.build.options`: polyfills can be defined cleanly as `["zone.js"]` or retain reference to `src/polyfills.ts` containing `import 'zone.js'`.
     - Maintain existing `@angular-devkit/build-angular:browser` or use `@angular-devkit/build-angular:application` depending on Karma runner integration needs. Keeping `@angular-devkit/build-angular:browser` + `@angular-devkit/build-angular:dev-server` + `@angular-devkit/build-angular:karma` ensures seamless backward compatibility with existing Karma unit test runners and Playwright dev server.
  2. In `tsconfig.json`:
     - Update compiler `target` to `"ES2022"`, `module` to `"ES2022"`, `moduleResolution` to `"node"`, and `lib` to `["ES2022", "dom"]`.
     - Ensure `experimentalDecorators` and Angular compiler options remain properly configured.
- **Rationale**:
  - Modern ES2022 targets allow Angular 22's build system to produce smaller, faster native JavaScript bundles without redundant polyfills or downlevel iterations.
- **Alternatives Considered**:
  - *Complete rebuild via `ng new` overwriting repo*: Rejected because it risks discarding custom Playwright configurations, project rules, Speckit specifications, and existing styling.

---

## 4. Component Architecture & Constitution Adherence

- **Decision**: Keep component hierarchy strictly compliant with Constitution Principles I & II:
  - `PixelComponent` remains a pure presentational component (`[on]`, `[row]`, `[col]`, `[role]`) with host attributes (`data-row`, `data-col`, `data-lit`, `data-role`).
  - `SceneComponent` remains the sole orchestrator of the game loop, snake movement, food generation, collisions, and controls.
  - Existing template syntax (`*ngFor`, `[ngClass]`, event bindings) and CSS styles remain intact.
  - In unit test `src/app/app.component.spec.ts`: modernize testing imports (replace deprecated `RouterTestingModule` with `provideRouter([])` or simple TestBed setup) to eliminate framework deprecation warnings.
- **Rationale**:
  - Preserves educational clarity, architectural contracts, and test fixture compatibility while upgrading the runtime engine.
- **Alternatives Considered**:
  - *Migrating to Angular Signals or Zoneless change detection*: Rejected because it introduces unnecessary architectural complexity into a straightforward educational codebase, violating Constitution Principle III ("Clareza para Estudo - no premature optimization or generic engine abstractions").

---

## 5. End-to-End & Unit Testing Validation Strategy

- **Decision**: Use the existing dual-layer testing suite as an unyielding validation gate:
  - **Unit Tests**: `npm test -- --watch=false --browsers=ChromeHeadless` runs Jasmine/Karma specs for `AppComponent`, `PixelComponent`, and `SceneComponent`.
  - **End-to-End Tests**: `npm run test:e2e` executes Playwright specs:
    - `smoke.spec.ts`: Grid structure, title, accessibility.
    - `controls.spec.ts`: Play/pause button, keyboard spacebar, directional navigation.
    - `rules.spec.ts`: Boundary collision, food spawning, snake growth, score updates.
- **Rationale**:
  - Playwright tests run against the live `http://localhost:4200` dev server, providing objective black-box verification that the Angular 22 runtime behaves identically to the baseline.

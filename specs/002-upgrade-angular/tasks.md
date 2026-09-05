# Tasks: Upgrade to Latest Stable Angular Version

**Input**: Design documents from `/specs/002-upgrade-angular/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui-observability.md`, `quickstart.md`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependency alignment and core project configuration for Angular 22 modernization

- [x] T001 Update package dependencies and devDependencies to Angular 22.1.5, TypeScript ~6.0.3, RxJS ^7.8.2, Zone.js ~0.16.3, and tslib ^2.8.1 in `package.json`
- [x] T002 Install updated dependency tree and generate refreshed lockfile via `package.json` and `package-lock.json`
- [x] T003 [P] Update workspace compiler options to target ES2022 and modern module resolution in `tsconfig.json`
- [x] T004 [P] Update application compiler options and polyfill configurations in `tsconfig.app.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core workspace builders, polyfills, and test harness infrastructure required before validating gameplay and test stories

**⚠️ CRITICAL**: No user story validation can begin until this phase is complete

- [x] T005 Modernize workspace build and dev-server configuration by removing obsolete `defaultProject` and updating browser target references to `buildTarget` in `angular.json`
- [x] T006 [P] Reconcile polyfill imports and zone bootstrap configuration in `src/polyfills.ts` and `src/main.ts`
- [x] T007 [P] Modernize Karma spec compiler declarations and include patterns in `tsconfig.spec.json`
- [x] T008 [P] Update Karma runner configuration plugins and reporter configurations for Karma 6.4 in `karma.conf.js`

**Checkpoint**: Angular 22 foundational configuration complete — user story execution can now proceed

---

## Phase 3: User Story 1 - Unbroken Retro Pixel Gameplay (Priority: P1) 🎯 MVP

**Goal**: Deliver seamless, 100% regression-free retro snake gameplay on the 20x50 on/off pixel grid with responsive keyboard and on-screen controls under Angular 22.

**Independent Test**: Launch the local application (`npm start`), observe the 20x50 pixel grid rendering, navigate the snake using arrow keys and on-screen buttons, consume food, verify snake elongation and score updates, toggle pause/resume, and verify boundary/self-collision game over alerts per `quickstart.md` Section 5.

### Implementation for User Story 1

- [x] T009 [P] [US1] Verify and preserve `PixelComponent` presentational host attributes (`data-row`, `data-col`, `data-lit`, `data-role`) and input bindings in `src/app/pixel/pixel.component.ts`
- [x] T010 [P] [US1] Verify pixel template CSS class bindings and rendering efficiency in `src/app/pixel/pixel.component.html`
- [x] T011 [US1] Maintain 20x50 grid dimensions, timing intervals, and initial velocity configuration in `src/app/scene/scene.settings.ts`
- [x] T012 [US1] Verify `SceneComponent` game loop (`move()`), directional steering, collision detection, and food ingestion logic under Angular 22 in `src/app/scene/scene.component.ts`
- [x] T013 [P] [US1] Verify grid DOM bindings, `app-pixel` matrix rendering, and interactive control buttons in `src/app/scene/scene.component.html`
- [x] T014 [US1] Validate manual gameplay scenarios (movement, eating food, pause/resume, game over alert) in browser against `src/app/scene/scene.component.ts`

**Checkpoint**: User Story 1 MVP complete and independently functional

---

## Phase 4: User Story 2 - Automated Verification and Test Suite Continuity (Priority: P2)

**Goal**: Ensure all automated unit tests (Karma/Jasmine) and Playwright end-to-end regression tests pass with 100% reliability under Angular 22.

**Independent Test**: Execute `npm test -- --watch=false --browsers=ChromeHeadless` and `npm run test:e2e`; observe zero test failures and zero deprecation warnings.

### Implementation & Test Tasks for User Story 2

- [x] T015 [P] [US2] Modernize root component unit test by replacing deprecated `RouterTestingModule` with `provideRouter([])` in `src/app/app.component.spec.ts`
- [x] T016 [P] [US2] Verify `PixelComponent` unit test fixture creation and host binding assertions in `src/app/pixel/pixel.component.spec.ts`
- [x] T017 [US2] Verify `SceneComponent` unit test fixture creation and game initialization assertions in `src/app/scene/scene.component.spec.ts`
- [x] T018 [US2] Execute automated unit test suite in headless mode via Karma and Jasmine in `src/test.ts`
- [x] T019 [P] [US2] Validate Playwright E2E smoke tests for pixel grid rendering against Angular 22 dev server in `e2e/smoke.spec.ts`
- [x] T020 [P] [US2] Validate Playwright E2E control tests for pause and directional buttons in `e2e/controls.spec.ts`
- [x] T021 [US2] Validate Playwright E2E game rules tests for collisions and food growth in `e2e/rules.spec.ts`

**Checkpoint**: User Stories 1 and 2 validated with full automated test suite passing

---

## Phase 5: User Story 3 - Streamlined Build and Modern Development Workflow (Priority: P3)

**Goal**: Ensure clean, rapid local development startup (`npm start`) and production build packaging (`npm run build`) without deprecation warnings, legacy workarounds, or Node.js runtime incompatibility warnings.

**Independent Test**: Run `npx ng version` to confirm Node 24 support and run `npm run build` to verify clean production bundle generation in `dist/papa-pixel` in under 60 seconds.

### Implementation for User Story 3

- [x] T022 [US3] Validate development server startup and asset compilation in `angular.json`
- [x] T023 [US3] Validate production build bundle creation and budget thresholds in `angular.json`
- [x] T024 [P] [US3] Verify environment configuration mappings (`environment.prod.ts` replacement) in `src/environments/environment.prod.ts`
- [x] T025 [US3] Run security and dependency audit check to verify clean modern package graph in `package.json`

**Checkpoint**: Modern build and development workflow fully operational

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Project documentation updates and end-to-end quickstart validation across all scenarios

- [x] T026 [P] Update project runtime documentation and prerequisites with Node 24 and Angular 22 guidelines in `README.md`
- [x] T027 Execute end-to-end quickstart validation suite across all scenarios in `specs/002-upgrade-angular/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion. Delivers core MVP gameplay.
- **User Story 2 (Phase 4)**: Depends on Phase 3 completion. Validates automated test continuity.
- **User Story 3 (Phase 5)**: Depends on Phase 2 and Phase 3 completion. Confirms build/workflow optimization.
- **Polish (Phase 6)**: Depends on all user stories being complete.

### Parallel Opportunities

- In Phase 1: `T003` and `T004` can execute in parallel after `T001` and `T002`.
- In Phase 2: `T006`, `T007`, and `T008` can execute in parallel alongside `T005`.
- In Phase 3: `T009`, `T010`, and `T013` can execute in parallel.
- In Phase 4: `T015`, `T016`, `T019`, and `T020` can execute in parallel.
- In Phase 5: `T024` can run in parallel with `T022`.
- In Phase 6: `T026` can run in parallel with `T027`.

---

## Parallel Example: User Story 2

```bash
# Modernize independent component unit tests concurrently:
Task: "Modernize root component unit test by replacing deprecated RouterTestingModule with provideRouter([]) in src/app/app.component.spec.ts"
Task: "Verify PixelComponent unit test fixture creation and host binding assertions in src/app/pixel/pixel.component.spec.ts"

# Validate independent Playwright test suites concurrently:
Task: "Validate Playwright E2E smoke tests for pixel grid rendering against Angular 22 dev server in e2e/smoke.spec.ts"
Task: "Validate Playwright E2E control tests for pause and directional buttons in e2e/controls.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Execute Phase 1: Setup (`package.json`, `package-lock.json`, `tsconfig.json`).
2. Execute Phase 2: Foundational (`angular.json`, `src/polyfills.ts`, `karma.conf.js`).
3. Execute Phase 3: User Story 1 (`PixelComponent`, `SceneComponent`, grid rendering).
4. **VALIDATE MVP**: Verify retro gameplay in browser with zero visual or control regressions.

### Incremental Delivery

1. Setup + Foundational complete: Platform migrated to Angular 22 without Node 24 errors.
2. User Story 1 complete: Retro snake gameplay fully playable on the pixel grid (MVP).
3. User Story 2 complete: 100% of Karma unit tests and Playwright E2E tests passing.
4. User Story 3 complete: Optimized production builds and dev server verified.
5. Polish complete: Docs updated and quickstart verified end-to-end.

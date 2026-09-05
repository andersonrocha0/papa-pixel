# Quickstart Validation Guide: Angular Modernization

**Feature**: Upgrade to Latest Stable Angular Version  
**Feature Directory**: `specs/002-upgrade-angular`  
**Date**: 2026-09-04  

This guide provides end-to-end commands and verification steps to validate that the PapaPixel application runs cleanly on Angular 22 with zero behavioral, testing, or build regressions.

---

## 1. Prerequisites

- **Node.js**: `v24.16.0` (or compatible `^22.22.3 || ^24.15.0 || >=26.0.0`)
- **Package Manager**: npm 11+
- **Browser**: Google Chrome / Chromium installed for Karma and Playwright test executions.

---

## 2. Environment Verification

Confirm that the local runtime environment satisfies the modern Angular 22 engine requirements:

```bash
node -v
# Expected: v24.16.0 (or supported Node 24+ release)

npm -v
# Expected: 11.x
```

---

## 3. Installation & Dependency Alignment

After package updates are applied, install dependencies cleanly:

```bash
npm install
```

Verify that Angular CLI reports the upgraded version without Node incompatibility warnings:

```bash
npx ng version
# Expected: Angular CLI 22.1.5, Angular 22.1.5, supported Node environment
```

---

## 4. Automated Verification Scenarios

### Scenario A: Unit Test Suite
Execute the component and service unit tests in headless mode:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```
- **Expected Outcome**: All Karma/Jasmine tests (`AppComponent`, `PixelComponent`, `SceneComponent`) compile without errors and report 100% pass status.

### Scenario B: End-to-End Playwright Suite
Execute the automated browser test suite (spins up local server automatically on `http://localhost:4200`):

```bash
npm run test:e2e
```
- **Expected Outcome**: All Playwright test specs (`smoke.spec.ts`, `controls.spec.ts`, `rules.spec.ts`) pass with zero failures.

### Scenario C: Production Build
Verify that production assets compile and bundle cleanly:

```bash
npm run build
```
- **Expected Outcome**: Production bundles are generated in `dist/papa-pixel` with zero compiler errors and within budget thresholds.

---

## 5. Manual Smoke Test & Gameplay Check

Start the development server:

```bash
npm start
```

1. Open `http://localhost:4200` in a browser.
2. Observe the 20x50 green LCD pixel grid.
3. Verify the snake moves forward smoothly at startup.
4. Press directional keys (Up, Down, Left, Right) or click on-screen buttons; observe instant turn response.
5. Guide the snake into food; observe growth, score increment, and new food placement.
6. Press `Space` or click "Pause"; observe immediate freezing of the movement loop; press again to resume.
7. Steer into a wall or the snake body; verify the "You lost!" alert triggers and game restarts cleanly.

---

## References

- [Data Model & Domain Entities](data-model.md)
- [UI Observability & DOM Contract](contracts/ui-observability.md)
- [Feature Specification](spec.md)

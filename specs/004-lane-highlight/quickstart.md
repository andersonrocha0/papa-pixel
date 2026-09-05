# Quickstart: Destaque da Faixa de Navegação

**Feature**: `004-lane-highlight`  
**Date**: 2026-09-04

Validate that the snake’s current travel lane is hinted on the grid, follows the head after turns and wrap, stays put while paused, and resets on a new game. Domain details: [data-model.md](data-model.md). DOM hooks: [contracts/ui-observability.md](contracts/ui-observability.md).

---

## 1. Prerequisites

- Node.js 24.x (project already on Angular 22)
- `npm install` completed
- Chrome / Chromium for Karma and Playwright

---

## 2. Run the app

```bash
npm start
```

Open `http://localhost:4200`.

---

## 3. Manual checks

1. **Opening row**  
   The snake starts on row 0, heading right. That entire row’s empty cells look slightly cooler/grayer than the rest of the board. Other rows stay plain white. Inspect `[data-testid="game-grid"]`: `data-lane-axis="row"`, `data-lane-index="0"`.

2. **Horizontal travel**  
   Let the snake advance (or press Forward). The tint stays on row 0 as the head moves across columns. Snake and food on that row stay black, not tinted-as-empty.

3. **Turn to a column**  
   Press Down (or Move Down). After the head actually steps down, the row tint disappears and the head’s column lights instead (`data-lane-axis="col"`, `data-lane-index` = head column). Queuing Down without waiting a tick should not switch the lane yet.

4. **Pause planning**  
   Pause. The current lane stays highlighted. Resume; the next advance updates the lane as before.

5. **Wrap**  
   Drive into a far edge. The hint follows the head on the opposite side — no leftover tint on the old edge.

6. **Reset**  
   Collide with the body. Dismiss `You lost!`. Opening row 0 is highlighted again, not the last vertical column.

7. **No overlay**  
   The hint is the empty pixels themselves. There is no extra graphic outside `app-pixel`.

---

## 4. Automated checks

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

Expect existing scene/pixel/settings specs to pass, plus new cases for `laneFor` / `cellIsOnLane`, `start()` lane, applied turn, pause, and `data-lane` on Pixel.

```bash
npm run test:e2e
```

Expect existing smoke / controls / rules / speed to pass, plus `e2e/lane.spec.ts` covering opening row, turn to column, pause, and restart.

---

## 5. Helper smoke (optional)

`SceneSettings.laneFor({ i: 0, j: 3 }, 'row')` → `{ axis: 'row', index: 0 }`.  
`SceneSettings.laneFor({ i: 2, j: 7 }, 'col')` → `{ axis: 'col', index: 7 }`.  
`SceneSettings.cellIsOnLane(0, 10, { axis: 'row', index: 0 })` is true; `cellIsOnLane(1, 10, …)` is false.

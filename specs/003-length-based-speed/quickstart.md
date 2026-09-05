# Quickstart: Length-Based Snake Speed

**Feature**: `003-length-based-speed`  
**Date**: 2026-09-04

Validate that the snake speeds up as it grows, never exceeds a playable cap, resets on a new game, and shows the current speed on screen. Domain details: [data-model.md](data-model.md). DOM hooks: [contracts/ui-observability.md](contracts/ui-observability.md).

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

1. **Start pace and HUD**  
   Grid shows the 4-cell snake. Indicator outside the grid reads `Speed: 1` (`data-speed="1"`, `data-interval-ms="200"`). Snake advances at the familiar opening pace.

2. **Growth speeds up**  
   Steer into food (buttons or arrows). After the eat, the snake is longer, the next steps arrive sooner, and the indicator increments (`Speed: 2`, interval 190). Repeat a few times; each food below the cap raises the level by 1.

3. **Cap stays playable**  
   Keep eating until `data-speed="11"` / `data-interval-ms="100"`. Further food grows the body only. At this pace you can still see each step and turn between steps. Pause still freezes motion; the indicator stays visible and unchanged.

4. **Reset**  
   Collide with the body (or trigger restart). Dismiss `You lost!`. Length is 4 again, indicator is `Speed: 1` / 200 ms, opening pace is back.

5. **No grid glyphs**  
   Speed is not drawn as pixels inside `[data-testid="game-grid"]`.

---

## 4. Automated checks

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

Expect existing scene/pixel/app specs to pass, plus new cases for `speedForLength` / `speedLevelForLength` and `start()` resetting speed.

```bash
npm run test:e2e
```

Expect existing smoke / controls / rules to pass, plus coverage that the speed indicator is visible, updates after eat, and resets after loss.

---

## 5. Formula smoke (optional)

At the console or in a unit spec, `SceneSettings.speedForLength(4) === 200`, `speedForLength(9) === 150`, `speedForLength(14) === 100`, `speedForLength(20) === 100`.

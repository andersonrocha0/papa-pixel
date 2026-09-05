# UI Observability & DOM Contract: Angular 22 Upgrade

**Feature**: Upgrade to Latest Stable Angular Version  
**Feature Directory**: `specs/002-upgrade-angular`  
**Consumers**: Playwright E2E suite (`e2e/`), Karma unit tests (`src/app/**/*.spec.ts`)  
**Provider**: PapaPixel Angular UI (`SceneComponent`, `PixelComponent`)  

This contract guarantees that the modernization to Angular 22 retains identical DOM attributes, test hooks, selectors, and event bindings so that black-box testing and user interaction remain 100% stable.

---

## 1. Grid & Pixel Observability

| Selector / Attribute | Element | Description / Invariant |
|----------------------|---------|-------------------------|
| `[data-testid="game-grid"]` | `div` container | Outer root container wrapping all line/column cells. |
| `app-pixel` | Custom Element | Presentational pixel host component. |
| `[data-row="<number>"]` | `app-pixel` | Host binding reflecting 0-indexed row (\(0 \le \text{row} \le 19\)). |
| `[data-col="<number>"]` | `app-pixel` | Host binding reflecting 0-indexed column (\(0 \le \text{col} \le 49\)). |
| `[data-lit="true" \| "false"]` | `app-pixel` | Host binding reflecting boolean illumination state. |
| `[data-role="snake" \| "food" \| "empty"]` | `app-pixel` | Host binding reflecting semantic occupant role. |

### Invariants:
- Exactly \(20 \times 50 = 1000\) `app-pixel` elements are rendered within the DOM.
- If `data-lit="false"`, `data-role` MUST be `"empty"`.
- If `data-lit="true"`, `data-role` MUST be either `"snake"` or `"food"`.
- Snake segments are contiguous on the grid at any given tick.

---

## 2. Interactive Control Selectors

| Selector | Element | Action / Behavior |
|----------|---------|-------------------|
| `[data-testid="btn-pause"]` | `button` | Toggles pause state. Label toggles between `"Pause"` and `"Start"`. |
| `[data-testid="btn-move-up"]` | `button` | Directs snake upward (`Direction.Up`). |
| `[data-testid="btn-move-down"]` | `button` | Directs snake downward (`Direction.Down`). |
| `[data-testid="btn-move-forward"]` | `button` | Directs snake forward / right (`Direction.Forward`). |
| `[data-testid="btn-move-backward"]` | `button` | Directs snake backward / left (`Direction.Backward`). |

### Keyboard Listeners (`window:keydown`):
- `ArrowUp` → Direction Up
- `ArrowDown` → Direction Down
- `ArrowRight` → Direction Forward (Right)
- `ArrowLeft` → Direction Backward (Left)
- `Space` (`' '`) → Toggle Pause / Resume

---

## 3. Modal / Dialog Contract

| Trigger Event | Dialog Mechanism | Message Content | Expected Action |
|---------------|------------------|-----------------|-----------------|
| Snake self-collision | `window.alert(...)` | `"You lost!"` | Game pauses, alert is accepted, game restarts at initial position. |

---

## 4. Stability Guarantees

Under Angular 22:
- Host binding rendering (`@HostBinding('attr.data-*')`) MUST produce identical HTML attributes as Angular 13.
- Event binding syntax `(click)` and `@HostListener('window:keydown')` MUST dispatch synchronously and invoke the same scene methods.
- The dev-server port and default URL MUST remain `http://localhost:4200` to satisfy Playwright webServer configuration.

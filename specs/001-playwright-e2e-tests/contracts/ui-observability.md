# UI Observability Contract

**Feature**: `001-playwright-e2e-tests`  
**Consumers**: Playwright E2E suite (`e2e/`)  
**Provider**: PapaPixel Angular scene/pixel UI  

This contract defines the stable surface tests may rely on. Game rules stay
unchanged; attributes are for observation only.

## Grid

| Selector / attribute | Meaning |
|----------------------|---------|
| `[data-testid="game-grid"]` | Root container of the pixel matrix |
| `app-pixel` | One cell component instance |
| `[data-row]` | Zero-based row index (stringified int) |
| `[data-col]` | Zero-based column index |
| `[data-lit="true"\|"false"]` | Whether the pixel is on |
| `[data-role="snake"\|"food"\|"empty"]` | Logical role after last paint |

**Invariants**:
- Number of `app-pixel` nodes = `lines × columns` from central settings.
- `data-lit="false"` ⇒ `data-role="empty"`.
- Snake body cells use `data-role="snake"`; food uses `data-role="food"`.

## Controls

| Selector | Action |
|----------|--------|
| `[data-testid="btn-pause"]` | Toggle pause / resume (label may read Pause or Start) |
| `[data-testid="btn-move-up"]` | Set direction up |
| `[data-testid="btn-move-down"]` | Set direction down |
| `[data-testid="btn-move-forward"]` | Set direction forward (right) |
| `[data-testid="btn-move-backward"]` | Set direction backward (left) |

Keyboard (document/window):
- `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` — direction
- `Space` — toggle pause

## Dialogs

| Event | Text | Test handling |
|-------|------|----------------|
| `window.alert` on self-collision | `You lost!` | Accept dialog; then assert restart |

## Out of contract

- Exact CSS colors beyond on/off semantics
- Fixed food coordinates
- Internal TypeScript field names (`onOffController`, etc.)
- Parallel render APIs (canvas/SVG entities) — forbidden by constitution

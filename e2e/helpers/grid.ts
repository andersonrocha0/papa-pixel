import { Page, Locator } from '@playwright/test';

export interface CellCoord {
  row: number;
  col: number;
}

export interface GridSnapshot {
  totalCount: number;
  litCount: number;
  snakeCoords: CellCoord[];
  foodCoords: CellCoord[];
}

export function getGridLocator(page: Page): Locator {
  return page.locator('[data-testid="game-grid"]');
}

export function getAllPixelLocators(page: Page): Locator {
  return page.locator('app-pixel');
}

export function getLitPixelLocators(page: Page): Locator {
  return page.locator('[data-lit="true"]');
}

export function getSnakePixelLocators(page: Page): Locator {
  return page.locator('[data-role="snake"]');
}

export function getFoodPixelLocators(page: Page): Locator {
  return page.locator('[data-role="food"]');
}

export function getPauseButton(page: Page): Locator {
  return page.locator('[data-testid="btn-pause"]');
}

export function getMoveUpButton(page: Page): Locator {
  return page.locator('[data-testid="btn-move-up"]');
}

export function getMoveDownButton(page: Page): Locator {
  return page.locator('[data-testid="btn-move-down"]');
}

export function getMoveForwardButton(page: Page): Locator {
  return page.locator('[data-testid="btn-move-forward"]');
}

export function getMoveBackwardButton(page: Page): Locator {
  return page.locator('[data-testid="btn-move-backward"]');
}

export async function getSnakeCoordinates(page: Page): Promise<CellCoord[]> {
  const elements = await page.locator('[data-role="snake"]').all();
  const coords: CellCoord[] = [];
  for (const el of elements) {
    const row = Number(await el.getAttribute('data-row'));
    const col = Number(await el.getAttribute('data-col'));
    coords.push({ row, col });
  }
  return coords;
}

export async function getFoodCoordinates(page: Page): Promise<CellCoord[]> {
  const elements = await page.locator('[data-role="food"]').all();
  const coords: CellCoord[] = [];
  for (const el of elements) {
    const row = Number(await el.getAttribute('data-row'));
    const col = Number(await el.getAttribute('data-col'));
    coords.push({ row, col });
  }
  return coords;
}

export async function getGridSnapshot(page: Page): Promise<GridSnapshot> {
  const totalCount = await getAllPixelLocators(page).count();
  const litCount = await getLitPixelLocators(page).count();
  const snakeCoords = await getSnakeCoordinates(page);
  const foodCoords = await getFoodCoordinates(page);
  return {
    totalCount,
    litCount,
    snakeCoords,
    foodCoords,
  };
}

/**
 * Autopilot helper: steers snake toward current food cell until eaten.
 */
export async function autoSteerToFood(page: Page, timeoutMs = 25_000): Promise<boolean> {
  const startTime = Date.now();
  const initialSnake = await getSnakeCoordinates(page);
  const initialLength = initialSnake.length;

  while (Date.now() - startTime < timeoutMs) {
    const currentSnake = await getSnakeCoordinates(page);
    if (currentSnake.length > initialLength) {
      return true;
    }
    if (currentSnake.length === 0) {
      await page.waitForTimeout(100);
      continue;
    }

    const head = currentSnake[currentSnake.length - 1];
    const foods = await getFoodCoordinates(page);
    if (foods.length === 0) {
      await page.waitForTimeout(100);
      continue;
    }
    const food = foods[0];

    // Steer row first, then col
    let key = '';
    if (head.row < food.row) {
      key = 'ArrowDown';
    } else if (head.row > food.row) {
      key = 'ArrowUp';
    } else if (head.col < food.col) {
      key = 'ArrowRight';
    } else if (head.col > food.col) {
      key = 'ArrowLeft';
    }

    if (key) {
      await page.keyboard.press(key);
    }
    await page.waitForTimeout(180);
  }
  return false;
}

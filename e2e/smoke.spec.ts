import { test, expect } from '@playwright/test';
import {
  getGridLocator,
  getAllPixelLocators,
  getSnakePixelLocators,
  getFoodPixelLocators,
  getSnakeCoordinates,
} from './helpers/grid';

test.describe('User Story 1 - Smoke & Initial Grid State', () => {
  test('T008 [US1]: loads game, renders 20x50 pixel grid, and displays initial snake and food', async ({
    page,
  }) => {
    await page.goto('/');

    const grid = getGridLocator(page);
    await expect(grid).toBeVisible();

    const pixels = getAllPixelLocators(page);
    await expect(pixels).toHaveCount(1000);

    const snakePixels = getSnakePixelLocators(page);
    await expect(snakePixels).toHaveCount(4);

    const foodPixels = getFoodPixelLocators(page);
    await expect(foodPixels).toHaveCount(1);
  });

  test('T009 [US1]: snake automatically advances positions over time without input', async ({
    page,
  }) => {
    await page.goto('/');

    const initialSnake = await getSnakeCoordinates(page);
    expect(initialSnake.length).toBe(4);

    // Initial speed is 200ms per tick. Within 1-2 seconds, the snake should have advanced.
    await expect
      .poll(
        async () => {
          const currentSnake = await getSnakeCoordinates(page);
          const hasChanged = JSON.stringify(currentSnake) !== JSON.stringify(initialSnake);
          return hasChanged;
        },
        {
          message: 'Snake coordinates should change over time during automatic movement',
          timeout: 4_000,
        }
      )
      .toBe(true);
  });
});

import { test, expect } from '@playwright/test';
import {
  autoSteerToFood,
  getGridLocator,
  getLanePixelLocators,
  getMoveDownButton,
  getPauseButton,
  getSnakeCoordinates,
} from './helpers/grid';

test.describe('Travel lane highlight', () => {
  test.setTimeout(45_000);

  test('opening match highlights row 0', async ({ page }) => {
    await page.goto('/');

    const grid = getGridLocator(page);
    await expect(grid).toHaveAttribute('data-lane-axis', 'row');
    await expect(grid).toHaveAttribute('data-lane-index', '0');
    await expect(getLanePixelLocators(page)).toHaveCount(50);
  });

  test('applied Down move highlights the head column only', async ({ page }) => {
    await page.goto('/');

    const grid = getGridLocator(page);
    await getMoveDownButton(page).click();

    await expect(grid).toHaveAttribute('data-lane-axis', 'col', { timeout: 2_000 });

    const laneIndex = await grid.getAttribute('data-lane-index');
    expect(laneIndex).toBeTruthy();
    await expect(getLanePixelLocators(page)).toHaveCount(20);
    await expect(
      page.locator('app-pixel[data-row="0"][data-lane="true"]')
    ).toHaveCount(1);
    await expect(
      page.locator(`app-pixel[data-col="${laneIndex}"][data-lane="true"]`)
    ).toHaveCount(20);
  });

  test('pause keeps the current lane', async ({ page }) => {
    await page.goto('/');

    const grid = getGridLocator(page);
    await getMoveDownButton(page).click();
    await expect(grid).toHaveAttribute('data-lane-axis', 'col', { timeout: 2_000 });

    const axisBeforePause = await grid.getAttribute('data-lane-axis');
    const indexBeforePause = await grid.getAttribute('data-lane-index');

    await getPauseButton(page).click();
    await page.waitForTimeout(500);
    await expect(grid).toHaveAttribute('data-lane-axis', axisBeforePause ?? '');
    await expect(grid).toHaveAttribute('data-lane-index', indexBeforePause ?? '');
  });

  test('You lost! restores the opening row lane', async ({ page }) => {
    await page.goto('/');

    const grid = getGridLocator(page);
    const eaten = await autoSteerToFood(page, 30_000);
    expect(eaten).toBe(true);

    let dialogHandled = false;
    page.on('dialog', async (dialog) => {
      dialogHandled = true;
      await dialog.accept();
    });

    for (let i = 0; i < 6 && !dialogHandled; i++) {
      for (const key of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']) {
        if (dialogHandled) {
          break;
        }
        await page.keyboard.press(key);
        await page.waitForTimeout(220);
      }
    }

    await expect
      .poll(() => dialogHandled, {
        message: 'Expected You lost! after forcing a self-collision',
        timeout: 8_000,
      })
      .toBe(true);

    await expect
      .poll(async () => (await getSnakeCoordinates(page)).length, { timeout: 4_000 })
      .toBe(4);

    await expect(grid).toHaveAttribute('data-lane-axis', 'row');
    await expect(grid).toHaveAttribute('data-lane-index', '0');
  });
});

import { test, expect } from '@playwright/test';
import { autoSteerToFood, getSnakeCoordinates } from './helpers/grid';

function speedIndicator(page: import('@playwright/test').Page) {
  return page.locator('[data-testid="speed-indicator"]');
}

test.describe('Length-based speed', () => {
  test('indicator is visible at level 1 and increases after eating food', async ({ page }) => {
    await page.goto('/');

    const indicator = speedIndicator(page);
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveAttribute('data-speed', '1');
    await expect(indicator).toHaveAttribute('data-interval-ms', '200');
    await expect(indicator).toContainText('Speed: 1');

    const eaten = await autoSteerToFood(page, 30_000);
    expect(eaten).toBe(true);

    await expect(indicator).toHaveAttribute('data-speed', '2');
    await expect(indicator).toHaveAttribute('data-interval-ms', '190');
  });

  test('after You lost! the indicator returns to Speed 1 / 200ms', async ({ page }) => {
    await page.goto('/');

    const indicator = speedIndicator(page);
    const eaten = await autoSteerToFood(page, 30_000);
    expect(eaten).toBe(true);
    await expect(indicator).not.toHaveAttribute('data-interval-ms', '200');

    let dialogHandled = false;
    page.on('dialog', async (dialog) => {
      dialogHandled = true;
      await dialog.accept();
    });

    for (let i = 0; i < 8 && !dialogHandled; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(220);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(220);
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(220);
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(220);
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

    await expect(indicator).toHaveAttribute('data-speed', '1');
    await expect(indicator).toHaveAttribute('data-interval-ms', '200');
  });
});

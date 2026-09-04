import { test, expect } from '@playwright/test';
import {
  getPauseButton,
  getMoveDownButton,
  getMoveUpButton,
  getMoveForwardButton,
  getMoveBackwardButton,
  getSnakeCoordinates,
} from './helpers/grid';

test.describe('User Story 2 - Controls & Pause/Resume', () => {
  test('T010 [US2]: pause freezes movement and resume restarts movement via button and Space', async ({
    page,
  }) => {
    await page.goto('/');

    const pauseBtn = getPauseButton(page);
    await expect(pauseBtn).toHaveText('Pause');

    // 1. Pause via button
    await pauseBtn.click();
    await expect(pauseBtn).toHaveText('Start');

    const pausedSnake1 = await getSnakeCoordinates(page);
    await page.waitForTimeout(600); // 3 ticks (speed = 200ms)
    const pausedSnake2 = await getSnakeCoordinates(page);

    expect(pausedSnake2).toEqual(pausedSnake1);

    // 2. Resume via button
    await pauseBtn.click();
    await expect(pauseBtn).toHaveText('Pause');

    await expect
      .poll(async () => {
        const movingSnake = await getSnakeCoordinates(page);
        return JSON.stringify(movingSnake) !== JSON.stringify(pausedSnake2);
      })
      .toBe(true);

    // 3. Pause via Space key (click body to remove focus from pause button)
    await page.locator('body').click();
    await page.keyboard.press('Space');
    await expect(pauseBtn).toHaveText('Start');

    const pausedSnake3 = await getSnakeCoordinates(page);
    await page.waitForTimeout(600);
    const pausedSnake4 = await getSnakeCoordinates(page);
    expect(pausedSnake4).toEqual(pausedSnake3);

    // 4. Resume via Space key
    await page.keyboard.press('Space');
    await expect(pauseBtn).toHaveText('Pause');

    await expect
      .poll(async () => {
        const movingSnake = await getSnakeCoordinates(page);
        return JSON.stringify(movingSnake) !== JSON.stringify(pausedSnake4);
      })
      .toBe(true);
  });

  test('T011 [US2]: changes direction via UI buttons and arrow keys', async ({ page }) => {
    await page.goto('/');

    // 1. Turn Down via UI button
    const moveDownBtn = getMoveDownButton(page);
    await moveDownBtn.click();

    // Expect head row (or some segment) to advance to row > 0
    await expect
      .poll(
        async () => {
          const coords = await getSnakeCoordinates(page);
          return coords.some((c) => c.row > 0);
        },
        { message: 'Snake should move down after clicking Move Down button', timeout: 3_000 }
      )
      .toBe(true);

    // 2. Turn Forward (Right) via ArrowRight key
    await page.keyboard.press('ArrowRight');
    const coordsBeforeForward = await getSnakeCoordinates(page);
    const maxRow = Math.max(...coordsBeforeForward.map((c) => c.row));

    // After moving right on maxRow, column should advance while on that row
    await expect
      .poll(
        async () => {
          const coords = await getSnakeCoordinates(page);
          return coords.some((c) => c.row === maxRow && c.col > 3);
        },
        { message: 'Snake should advance columns after ArrowRight', timeout: 3_000 }
      )
      .toBe(true);

    // 3. Turn Up via UI button
    const moveUpBtn = getMoveUpButton(page);
    await moveUpBtn.click();

    await expect
      .poll(
        async () => {
          const coords = await getSnakeCoordinates(page);
          return coords.some((c) => c.row < maxRow);
        },
        { message: 'Snake should advance upward after Move Up button', timeout: 3_000 }
      )
      .toBe(true);

    // 4. Turn Backward (Left) via ArrowLeft key
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(400);
    const coordsLeft = await getSnakeCoordinates(page);
    expect(coordsLeft.length).toBeGreaterThanOrEqual(4);
  });

  test('T012 [US2]: arrow key presses while paused do not alter direction until resumed', async ({
    page,
  }) => {
    await page.goto('/');

    const pauseBtn = getPauseButton(page);
    // Pause immediately
    await pauseBtn.click();
    await expect(pauseBtn).toHaveText('Start');

    const pausedSnake = await getSnakeCoordinates(page);

    // Press ArrowDown while paused — should be ignored by keyEvent
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(400);

    const stillPausedSnake = await getSnakeCoordinates(page);
    expect(stillPausedSnake).toEqual(pausedSnake);

    // Resume: since the ArrowDown was ignored, initial moveDirection (Forward) should continue!
    await pauseBtn.click();
    await expect(pauseBtn).toHaveText('Pause');

    // Wait for movement: head should continue moving Forward on row 0 (not Down to row 1)
    await expect
      .poll(
        async () => {
          const movingSnake = await getSnakeCoordinates(page);
          return movingSnake.some((c) => c.col > 3 && c.row === 0);
        },
        {
          message: 'Snake should continue Forward on row 0 because ArrowDown was ignored during pause',
          timeout: 3_000,
        }
      )
      .toBe(true);
  });
});

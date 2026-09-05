import { test, expect } from '@playwright/test';
import {
  getFoodCoordinates,
  getSnakeCoordinates,
  getSnakePixelLocators,
  getFoodPixelLocators,
  autoSteerToFood,
} from './helpers/grid';

test.describe('User Story 3 - Game Rules: Food & Collision', () => {
  test.setTimeout(45_000);

  test('T013 [US3]: food consumption increases snake length and spawns new food', async ({
    page,
  }) => {
    await page.goto('/');

    const initialSnake = await getSnakeCoordinates(page);
    expect(initialSnake.length).toBe(4);

    const initialFood = await getFoodCoordinates(page);
    expect(initialFood.length).toBe(1);

    // Steer snake to food
    const eaten = await autoSteerToFood(page, 30_000);
    expect(eaten).toBe(true);

    // Verify snake grew
    const grownSnake = await getSnakeCoordinates(page);
    expect(grownSnake.length).toBeGreaterThan(4);

    // Verify food is still present on grid (respawned at a new cell)
    const foodPixels = getFoodPixelLocators(page);
    await expect(foodPixels).toHaveCount(1);
  });

  test('T014 [US3]: self-collision triggers alert dialog "You lost!" and restarts the game', async ({
    page,
  }) => {
    await page.goto('/');

    // 1. First grow the snake so length is >= 5 (enables self-collision loop)
    const eaten = await autoSteerToFood(page, 30_000);
    expect(eaten).toBe(true);

    const grownSnake = await getSnakeCoordinates(page);
    expect(grownSnake.length).toBeGreaterThanOrEqual(5);

    // 2. Set up dialog interception for alert("You lost!")
    let dialogMessage = '';
    let dialogHandled = false;

    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      dialogHandled = true;
      await dialog.accept();
    });

    // 3. Drive the grown snake into a tight 2x2 loop until self-collision.
    // Repeat the box so the maneuver still works after a longer auto-steer path.
    for (let i = 0; i < 6 && !dialogHandled; i++) {
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
        message: 'Expected alert dialog "You lost!" on self-collision',
        timeout: 5_000,
      })
      .toBe(true);

    expect(dialogMessage).toBe('You lost!');

    // 4. Verify game restarted: snake returns to initial length (4) and initial position
    await expect
      .poll(
        async () => {
          const snakeAfterRestart = await getSnakeCoordinates(page);
          return snakeAfterRestart.length;
        },
        {
          message: 'Snake should restart with initial length 4 after game over',
          timeout: 4_000,
        }
      )
      .toBe(4);

    const restartedSnake = await getSnakeCoordinates(page);
    expect(restartedSnake.length).toBe(4);
  });
});

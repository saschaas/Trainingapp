import { test, expect } from '@playwright/test';

test('capture history tab screenshot with data', async ({ page }) => {
  // Go to the app
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1000);

  // First, let's complete a training to have data
  // Click on PUSH tab (should be there by default)
  await page.click('text=PUSH');
  await page.waitForTimeout(500);

  // Fill in some exercise data - look for input fields
  const weightInputs = page.locator('input[inputmode="decimal"]').first();
  const repsInputs = page.locator('input[inputmode="numeric"]').first();

  // Check if there are exercises
  const hasExercises = await page.locator('.exercise-card').count() > 0;

  if (hasExercises) {
    // Fill in first weight and reps
    await weightInputs.fill('80');
    await repsInputs.fill('10');
    await page.waitForTimeout(200);

    // Save the training
    const saveBtn = page.locator('button:has-text("Speichern")').first();
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await page.waitForTimeout(500);

      // Confirm save if modal appears
      const confirmBtn = page.locator('.modal button:has-text("Speichern")');
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
        await page.waitForTimeout(500);
      }
    }
  }

  // Now go to HISTORIE tab
  await page.click('text=HISTORIE');
  await page.waitForTimeout(500);

  // Take screenshot
  await page.screenshot({ path: 'history-screenshot.png', fullPage: true });
});

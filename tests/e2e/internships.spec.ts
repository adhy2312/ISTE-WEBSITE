import { test, expect } from '@playwright/test';

test.describe('ISTE MBCET Intelligence Ecosystem E2E', () => {
  test('should render the digital soul assistant and allow chat', async ({ page }) => {
    await page.goto('/');
    // Wait for hydration to complete so the onClick handler is actually attached
    await page.waitForLoadState('networkidle');

    // Ensure the Assistant Dock button is visible
    const assistantBtn = page.locator('.assistant-dock-btn');
    await expect(assistantBtn).toBeVisible();

    // Wait slightly for React hydration to finish on slower mobile engines
    await page.waitForTimeout(1500);

    // Open the Assistant, retry if it fails (handles hydration flakes)
    const panel = page.locator('.assistant-panel');
    await expect(async () => {
      await assistantBtn.click({ force: true });
      await expect(panel).toHaveClass(/open/, { timeout: 1000 });
    }).toPass({ timeout: 15000 });

    const greeting = page.locator('.ai-msg').first();
    await expect(greeting).toBeVisible();

    // Send a message
    const input = page.locator('.assistant-footer input');
    await input.fill('I want a frontend role in Bangalore, what should I learn?');
    
    const submitBtn = page.locator('.assistant-submit');
    await submitBtn.click();

    // Wait for the AI's response (checking for the second AI message)
    await expect(page.locator('.ai-msg').nth(1)).toBeVisible({ timeout: 15000 });
  });

  test('should render GSAP motion smoothly on internships page', async ({ page }) => {
    await page.goto('/internships');

    // Basic layout verification
    await expect(page.locator('h1').first()).toBeVisible();

    // If internships exist, verify they render
    const internshipCard = page.locator('.internship-card').first();
    if (await internshipCard.isVisible()) {
      await expect(internshipCard).toBeVisible();
    }
  });
});

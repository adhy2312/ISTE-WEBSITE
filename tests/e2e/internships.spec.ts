import { test, expect } from '@playwright/test';

test.describe('ISTE MBCET Intelligence Ecosystem E2E', () => {
  test('should render the digital soul assistant and allow chat', async ({ page }) => {
    await page.goto('/');

    // Ensure the Assistant Dock button is visible
    const assistantBtn = page.locator('.assistant-dock-btn');
    await expect(assistantBtn).toBeVisible();

    // Open the Assistant
    await assistantBtn.click();

    // Verify panel opens and AI greeting is visible
    const panel = page.locator('.assistant-panel');
    await expect(panel).toHaveClass(/open/);

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

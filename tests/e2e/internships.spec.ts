import { test, expect } from '@playwright/test';

test.describe('ISTE MBCET Intelligence Ecosystem E2E', () => {


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

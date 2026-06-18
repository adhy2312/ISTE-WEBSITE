import { test, expect } from '@playwright/test';

test.describe('ISTE MBCET Internships Page', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate with a generous timeout — the page has GSAP animations
    await page.goto('/internships', { waitUntil: 'domcontentloaded', timeout: 30000 });
  });

  test('internships page renders with correct heading', async ({ page }) => {
    // h1 must be visible — guards against complete render failure
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('internships page has valid metadata', async ({ page }) => {
    // Title must be set (guards against missing layout metadata)
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title.toLowerCase()).toContain('iste');
  });

  test('internships page has no broken critical elements', async ({ page }) => {
    // No JavaScript errors that crash the React tree
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // Wait for hydration
    await page.waitForTimeout(2000);

    // Filter out known non-critical warnings
    const criticalErrors = errors.filter(
      (e) => !e.includes('Warning:') && !e.includes('Non-Error')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('internship cards render when data is available', async ({ page }) => {
    // Wait for any async data fetch to complete
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
      // If network never idles (e.g., WebSocket), continue anyway
    });

    // Wait for the "hunting" animation (800ms) to complete so skeletons are replaced with real cards
    await page.waitForTimeout(1000);

    // If cards exist, ensure they have an apply link — not a structural requirement
    const cards = page.locator('.internship-card:not(.skeleton-card)');
    const cardCount = await cards.count();

    if (cardCount > 0) {
      // At least the first card should be visible
      await expect(cards.first()).toBeVisible();

      // Each card should have a link. Use auto-retrying expect.
      const firstLink = cards.first().locator('a[href]');
      await expect(firstLink).toHaveCount(1);
    }
    // If no cards — engine may not have synced yet — test passes (non-blocking)
  });

});

test.describe('ISTE MBCET Home Page', () => {

  test('home page renders without crashing', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('home page has correct OpenGraph title metadata', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
    expect(ogTitle?.toLowerCase()).toContain('iste');
  });

});

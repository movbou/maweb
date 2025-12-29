import { test, expect } from '@playwright/test';

test.describe('Manga Features', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('http://localhost:3000');
  });

  test('should navigate to manga browse page from navbar', async ({ page }) => {
    // Click on Browse Manga in the navbar
    await page.click('text=Browse Manga');
    
    // Wait for navigation
    await page.waitForURL('**/manga/browse');
    
    // Check if the page title is present
    await expect(page.locator('h1')).toContainText('Browse Manga');
    
    // Check if search input is present
    await expect(page.locator('input[placeholder*="Search manga"]')).toBeVisible();
  });

  test('should display manga type filter tabs', async ({ page }) => {
    await page.goto('http://localhost:3000/manga/browse');
    
    // Check if all filter tabs are present
    await expect(page.locator('text=All').first()).toBeVisible();
    await expect(page.locator('text=Manga').first()).toBeVisible();
    await expect(page.locator('text=Manhwa')).toBeVisible();
    await expect(page.locator('text=Manhua')).toBeVisible();
  });

  test('should search for manga', async ({ page }) => {
    await page.goto('http://localhost:3000/manga/browse');
    
    // Fill in the search input
    await page.fill('input[placeholder*="Search manga"]', 'One Piece');
    
    // Click the search button
    await page.click('button:has-text("Search")');
    
    // Wait for the URL to update with search query
    await page.waitForURL('**/manga/browse?q=One+Piece');
    
    // Wait for results to load (either manga cards or loading skeletons should disappear)
    await page.waitForTimeout(2000);
  });

  test('should filter manga by type', async ({ page }) => {
    await page.goto('http://localhost:3000/manga/browse');
    
    // Wait for initial load
    await page.waitForTimeout(1000);
    
    // Click on Manhwa filter
    await page.click('text=Manhwa');
    
    // Check if URL updated with type filter
    await page.waitForURL('**/manga/browse?type=manhwa');
  });

  test('should load manga details page', async ({ page }) => {
    await page.goto('http://localhost:3000/manga/browse');
    
    // Wait for manga cards to load
    await page.waitForTimeout(2000);
    
    // Find and click on the first manga card (if available)
    const mangaCard = page.locator('a[href*="/manga/"]').first();
    
    if (await mangaCard.isVisible()) {
      await mangaCard.click();
      
      // Wait for navigation to manga detail page
      await page.waitForURL('**/manga/**');
      
      // Check if Back button is present
      await expect(page.locator('button:has-text("Back")')).toBeVisible();
      
      // Check if Start Reading button is present
      await expect(page.locator('text=Start Reading')).toBeVisible();
      
      // Check if tabs are present
      await expect(page.locator('text=Overview')).toBeVisible();
      await expect(page.locator('text=Chapters')).toBeVisible();
    }
  });

  test('should navigate to manga reader', async ({ page }) => {
    // Go directly to a manga detail page with ID 1
    await page.goto('http://localhost:3000/manga/1');
    
    // Wait for page to load
    await page.waitForTimeout(1000);
    
    // Click Start Reading button
    const startReadingButton = page.locator('text=Start Reading');
    if (await startReadingButton.isVisible()) {
      await startReadingButton.click();
      
      // Wait for navigation to reader
      await page.waitForURL('**/manga/1/read/1');
      
      // Check if reader controls are present
      await expect(page.locator('text=Chapter 1')).toBeVisible();
      await expect(page.locator('text=Page')).toBeVisible();
    }
  });

  test('should display reader controls', async ({ page }) => {
    // Go directly to reader page
    await page.goto('http://localhost:3000/manga/1/read/1');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check if navigation buttons are present (need to interact to show controls)
    await page.mouse.move(500, 500);
    await page.waitForTimeout(500);
    
    // Check for chapter navigation
    await expect(page.locator('text=Previous Chapter')).toBeVisible();
    await expect(page.locator('text=Next Chapter')).toBeVisible();
  });

  test('should navigate between pages in reader', async ({ page }) => {
    await page.goto('http://localhost:3000/manga/1/read/1');
    
    // Wait for reader to load
    await page.waitForTimeout(2000);
    
    // Press right arrow key to go to next page
    await page.keyboard.press('ArrowRight');
    
    // Wait a bit for the navigation
    await page.waitForTimeout(500);
    
    // Check if page number changed (should show Page 2)
    await expect(page.locator('text=Page 2')).toBeVisible();
  });

  test('should navigate to next chapter', async ({ page }) => {
    await page.goto('http://localhost:3000/manga/1/read/1');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Show controls by moving mouse
    await page.mouse.move(500, 500);
    await page.waitForTimeout(500);
    
    // Click Next Chapter button
    await page.click('text=Next Chapter');
    
    // Wait for navigation
    await page.waitForURL('**/manga/1/read/2');
    
    // Verify we're on chapter 2
    await expect(page.locator('text=Chapter 2')).toBeVisible();
  });

  test('should toggle reading mode settings', async ({ page }) => {
    await page.goto('http://localhost:3000/manga/1/read/1');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Move mouse to show controls
    await page.mouse.move(500, 300);
    await page.waitForTimeout(500);
    
    // Click on settings button
    const settingsButton = page.locator('button').filter({ has: page.locator('svg') }).nth(1);
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      
      // Check if reading mode options are visible
      await expect(page.locator('text=Reading Mode')).toBeVisible();
      await expect(page.locator('text=Horizontal')).toBeVisible();
      await expect(page.locator('text=Vertical')).toBeVisible();
    }
  });

  test('should handle back navigation from manga detail page', async ({ page }) => {
    await page.goto('http://localhost:3000/manga/1');
    
    // Wait for page to load
    await page.waitForTimeout(1000);
    
    // Click the back button
    await page.click('button:has-text("Back")');
    
    // Should navigate back (to browse or previous page)
    await page.waitForTimeout(500);
  });

  test('should display popular manga API endpoint', async ({ page }) => {
    // Test the API endpoint directly
    const response = await page.request.get('http://localhost:3000/api/manga/popular');
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('should display random manga API endpoint', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/api/manga/random');
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('title');
  });

  test('should search manga via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/api/manga/search?q=naruto&limit=10');
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('results');
    expect(Array.isArray(data.results)).toBeTruthy();
  });

  test('should get manga details via API', async ({ page }) => {
    // Test with a known manga ID (One Piece = 13)
    const response = await page.request.get('http://localhost:3000/api/manga/13');
    
    if (response.ok()) {
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('title');
      expect(data).toHaveProperty('image');
    }
  });

  test('should get chapter data via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/api/manga/1/read/1');
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('pages');
    expect(Array.isArray(data.pages)).toBeTruthy();
  });
});

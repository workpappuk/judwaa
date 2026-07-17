import { test, expect } from '@playwright/test';

const APP_BASE_URL = 'http://localhost:3000';

test('data collector supports search, navigation, and persisted data modal', async ({ page }) => {
  await page.goto(`${APP_BASE_URL}/data-collector`);

  const collectorSearch = page.getByPlaceholder('Search by name, id, or category');
  await collectorSearch.fill('zzz-no-match');
  await expect(page.getByText(/no collectors found for this search\./i)).toBeVisible();
  await page.getByRole('button', { name: /clear collector search/i }).click();

  await expect(page.getByRole('button', { name: /next/i })).toBeVisible();
  await page.getByRole('button', { name: /next/i }).click();
  await expect(page.getByText(/step \d+ of \d+/i)).toBeVisible();

  await page.getByRole('button', { name: /view persisted data/i }).click();
  await expect(page.getByText(/persisted data:/i)).toBeVisible();
  await page.getByRole('button', { name: /close persisted data modal/i }).click();
});

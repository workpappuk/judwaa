import { test, expect } from '@playwright/test';

const APP_BASE_URL = 'http://localhost:3000';

test('auth page validates empty login and register forms', async ({ page }) => {
  await page.goto(`${APP_BASE_URL}/auth`);

  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page.getByText(/username and password are required\./i)).toBeVisible();

  await page.getByRole('tab', { name: /register/i }).click();
  await page.getByRole('button', { name: /create account/i }).click();
  await expect(page.getByText(/username and password are required\./i)).toBeVisible();
});

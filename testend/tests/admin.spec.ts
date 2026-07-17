import { test, expect } from '@playwright/test';

const APP_BASE_URL = 'http://localhost:3000';

test('admin force-logout flow validates missing admin session', async ({ page }) => {
  await page.goto(`${APP_BASE_URL}/judwaa/admin`);
  await page.getByRole('link', { name: /force logout/i }).click();
  await expect(page).toHaveURL(/\/judwaa\/admin\/security\/forcelogout$/);

  await page.getByRole('button', { name: /force logout token/i }).click();
  await expect(page.getByText(/login as admin first to use force logout\./i)).toBeVisible();
});

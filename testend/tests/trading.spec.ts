import { test, expect } from '@playwright/test';

const APP_BASE_URL = 'http://localhost:3000';

test('trading F&O page supports tab switching', async ({ page }) => {
  await page.goto(`${APP_BASE_URL}/trading/f&o`);

  await expect(page.getByRole('tab', { name: /positions/i })).toBeVisible();
  await expect(page.getByText(/no positions selected|restoring saved positions/i)).toBeVisible();

  await page.getByRole('tab', { name: /orders/i }).click();
  await expect(page.getByText(/no orders created|restoring selected instruments/i)).toBeVisible();
});

test('instrument page neo actions validates empty totp', async ({ page }) => {
  await page.goto(`${APP_BASE_URL}/trading/instrument`);

  await page.getByRole('button', { name: /neo actions/i }).click();
  await expect(page.getByRole('heading', { name: 'Neo Actions', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /login neo/i }).click();
  await expect(page.getByText(/totp is required\./i)).toBeVisible();
  await page.getByRole('button', { name: /close neo actions/i }).click();
});

test('stoploss calculator updates auto quantity from capital input', async ({ page }) => {
  await page.goto(`${APP_BASE_URL}/trading/calculator/stoploss`);

  const quantityInput = page.getByRole('spinbutton', { name: /quantity \(auto\)/i });
  await expect(quantityInput).toHaveValue('10');

  await page.getByRole('spinbutton', { name: /total capital/i }).fill('500000');
  await expect(quantityInput).toHaveValue('2');

  await page.getByRole('button', { name: /buyer/i }).click();
  await expect(page.getByRole('button', { name: /buyer/i })).toBeVisible();
});

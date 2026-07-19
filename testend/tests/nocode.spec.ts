import { expect, test } from '@playwright/test';

const APP_BASE_URL = 'http://localhost:3000';

test('nocode marketing page renders polished CTAs', async ({ page }) => {
  await page.goto(`${APP_BASE_URL}/nocode/marketing`);

  await expect(page.getByRole('heading', { name: /build enterprise apps from metadata/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /start company onboarding/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /open platform admin/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /explore studio/i })).toBeVisible();

  await expect(page.getByText(/schema versioning/i)).toBeVisible();
  await expect(page.getByText(/tenant ready/i)).toBeVisible();
  await expect(page.getByText('Role Controls', { exact: true })).toBeVisible();
});

test('nocode onboarding surfaces API validation errors on incomplete payload', async ({ page }) => {
  await page.goto(`${APP_BASE_URL}/nocode/onboard`);

  await page.getByRole('button', { name: /^next$/i }).click();
  await expect(page.getByText(/please fill: company name/i)).toBeVisible();

  const unique = Date.now();

  await page.getByRole('textbox', { name: /company name/i }).fill(`Playwright Co ${unique}`);
  await page.getByRole('textbox', { name: /contact name/i }).fill('Playwright User');
  await page.getByRole('textbox', { name: /contact email/i }).fill(`playwright.${unique}@example.com`);
  await page.getByRole('textbox', { name: /contact phone/i }).fill('+14155550123');
  await page.getByRole('textbox', { name: /country/i }).fill('India');
  await page.getByRole('button', { name: /^next$/i }).click();

  await page.getByRole('combobox').nth(0).click();
  await page.getByRole('option', { name: /human resources/i }).click();
  await page.getByRole('combobox').nth(1).click();
  await page.getByRole('option', { name: /^51-200$/i }).click();
  await page.getByRole('combobox').nth(2).click();
  await page.getByRole('option', { name: /within 30 days/i }).click();
  await page.getByRole('button', { name: /^next$/i }).click();

  await page.getByRole('textbox', { name: /primary use case/i }).fill('Automate onboarding workflows across business units.');
  await page.getByRole('textbox', { name: /integration needs/i }).fill('Need integration with ERP and identity provider.');
  await page.getByRole('radio', { name: /^yes$/i }).check();
  await page.getByRole('checkbox', { name: /i confirm that the submitted information is accurate/i }).check();

  await page.getByRole('button', { name: /submit onboarding/i }).click();

  await expect(page.getByText(/too_small/i).first()).toBeVisible();
  await expect(page.getByText(/invalid email address/i)).toBeVisible();
});

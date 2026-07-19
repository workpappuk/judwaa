import { expect, test } from '@playwright/test';

test('owner can create property/unit, generate invite, and accept it', async ({ page }) => {
  const stamp = Date.now();
  const propertyName = `E2E Property ${stamp}`;
  const unitName = `E2E Unit ${stamp}`;

  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.getByTestId('property-name').fill(propertyName);
  await page.getByTestId('property-line1').fill('100 Automation Street');
  await page.getByTestId('property-city').fill('Bengaluru');
  await page.getByTestId('property-state').fill('KA');
  await page.getByTestId('property-pincode').fill('560001');
  await page.getByTestId('property-submit').click();

  await expect(page.getByText(propertyName)).toBeVisible();
  await page.getByRole('link', { name: 'Open' }).first().click();

  await page.getByTestId('unit-name').fill(unitName);
  await page.getByTestId('unit-submit').click();
  await expect(page.getByText(unitName)).toBeVisible();

  await page.getByRole('combobox', { name: 'Role' }).click();
  await page.getByRole('option', { name: 'tenant' }).click();
  await page.getByRole('combobox', { name: 'Rentable Unit' }).click();
  await page.getByRole('option', { name: unitName }).click();
  await page.getByTestId('invite-submit').click();

  const inviteUrlText = await page.getByTestId('invite-url').textContent();
  expect(inviteUrlText).toBeTruthy();
  const inviteUrl = inviteUrlText as string;

  await page.goto(inviteUrl);
  await expect(page.getByRole('heading', { name: 'Invitation' })).toBeVisible();
  await page.getByTestId('accept-invite').click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

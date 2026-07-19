import { expect, test, type BrowserContext } from '@playwright/test';

async function setE2EUser(context: BrowserContext, user: { id: string; email: string; name: string }) {
  await context.addCookies([
    { name: 'e2e_user_id', value: user.id, url: 'http://127.0.0.1:3100' },
    { name: 'e2e_user_email', value: user.email, url: 'http://127.0.0.1:3100' },
    { name: 'e2e_user_name', value: user.name, url: 'http://127.0.0.1:3100' },
  ]);
}

test('owner onboards property and tenant accepts invite then accesses property pages', async ({ browser }) => {
  const stamp = Date.now();
  const propertyName = `Owner Tenant Property ${stamp}`;
  const unitName = `Tenant Unit ${stamp}`;
  const tenantEmail = `tenant-${stamp}@example.com`;

  const ownerContext = await browser.newContext();
  await setE2EUser(ownerContext, {
    id: '66f0a1b9b2c3d4e5f6071829',
    email: 'owner-e2e@example.com',
    name: 'E2E Owner',
  });
  const ownerPage = await ownerContext.newPage();

  await ownerPage.goto('/dashboard');
  await expect(ownerPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await ownerPage.getByTestId('property-name').fill(propertyName);
  await ownerPage.getByTestId('property-line1').fill('101 Owner Street');
  await ownerPage.getByTestId('property-city').fill('Bengaluru');
  await ownerPage.getByTestId('property-state').fill('KA');
  await ownerPage.getByTestId('property-pincode').fill('560001');
  await ownerPage.getByTestId('property-submit').click();

  await expect(ownerPage.getByText(propertyName)).toBeVisible();
  await ownerPage.getByRole('link', { name: 'Open' }).first().click();

  await ownerPage.getByTestId('unit-name').fill(unitName);
  await ownerPage.getByTestId('unit-submit').click();
  await expect(ownerPage.getByText(unitName)).toBeVisible();

  await ownerPage.goto(ownerPage.url().replace(/\/$/, '') + '/invitations');
  await expect(ownerPage.getByRole('heading', { name: `${propertyName} - Invitations` })).toBeVisible();

  await ownerPage.getByRole('combobox', { name: 'Role' }).click();
  await ownerPage.getByRole('option', { name: 'tenant' }).click();
  await ownerPage.getByRole('combobox', { name: 'Rentable Unit' }).click();
  await ownerPage.getByRole('option', { name: unitName }).click();
  await ownerPage.getByTestId('invite-email').fill(tenantEmail);
  await ownerPage.getByTestId('invite-submit').click();

  const inviteUrlText = await ownerPage.getByTestId('invite-url').textContent();
  expect(inviteUrlText).toBeTruthy();
  const inviteUrl = inviteUrlText as string;

  const tenantContext = await browser.newContext();
  await setE2EUser(tenantContext, {
    id: '66f0a1b9b2c3d4e5f6071831',
    email: tenantEmail,
    name: 'E2E Tenant',
  });
  const tenantPage = await tenantContext.newPage();

  await tenantPage.goto(inviteUrl);
  await expect(tenantPage.getByRole('heading', { name: 'Invitation' })).toBeVisible();
  await tenantPage.getByTestId('accept-invite').click();

  await expect(tenantPage).toHaveURL(/\/dashboard$/);
  await expect(tenantPage.getByText(propertyName)).toBeVisible();

  await tenantPage.getByRole('link', { name: 'Open' }).first().click();
  await expect(tenantPage.getByRole('heading', { name: propertyName })).toBeVisible();

  await expect(tenantPage.getByRole('link', { name: 'My Stays' })).toBeVisible();
  await expect(tenantPage.getByRole('link', { name: 'My Bills' })).toBeVisible();
  await expect(tenantPage.getByRole('link', { name: 'My Complaints' })).toBeVisible();
  await expect(tenantPage.getByRole('link', { name: 'Units' })).toHaveCount(0);
  await expect(tenantPage.getByRole('link', { name: 'Invitations' })).toHaveCount(0);

  const propertyUrl = tenantPage.url();
  const propertyPathMatch = propertyUrl.match(/\/dashboard\/properties\/([^/?#]+)/);
  expect(propertyPathMatch).toBeTruthy();
  const propertyId = propertyPathMatch?.[1] as string;

  await tenantPage.goto(`/dashboard/properties/${propertyId}/stays`);
  await expect(tenantPage.getByRole('heading', { name: `${propertyName} - Stays` })).toBeVisible();

  await tenantPage.goto(`/dashboard/properties/${propertyId}/bills`);
  await expect(tenantPage.getByRole('heading', { name: `${propertyName} - Bills` })).toBeVisible();

  await tenantPage.goto(`/dashboard/properties/${propertyId}/complaints`);
  await expect(tenantPage.getByRole('heading', { name: `${propertyName} - Complaints` })).toBeVisible();

  await tenantPage.goto(`/dashboard/properties/${propertyId}/units`);
  await expect(tenantPage).toHaveURL(/\/dashboard$/);

  await ownerContext.close();
  await tenantContext.close();
});

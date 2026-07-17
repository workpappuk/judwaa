import { test, expect } from '@playwright/test';

const APP_BASE_URL = 'http://localhost:3000';

test('lms hub navigates to each management page', async ({ page }) => {
  await page.goto(`${APP_BASE_URL}/lms`);

  await page.getByRole('link', { name: /organization management/i }).click();
  await expect(page).toHaveURL(/\/lms\/organization-management$/);

  await page.goto(`${APP_BASE_URL}/lms`);
  await page.getByRole('link', { name: /school management/i }).click();
  await expect(page).toHaveURL(/\/lms\/school-management$/);

  await page.goto(`${APP_BASE_URL}/lms`);
  await page.getByRole('link', { name: /school routes/i }).click();
  await expect(page).toHaveURL(/\/lms\/school-routes$/);

  await page.goto(`${APP_BASE_URL}/lms`);
  await page.getByRole('link', { name: /student management/i }).click();
  await expect(page).toHaveURL(/\/lms\/student-management$/);

  await page.goto(`${APP_BASE_URL}/lms`);
  await page.getByRole('link', { name: /exam management/i }).click();
  await expect(page).toHaveURL(/\/lms\/exam-management$/);
});

test('school routes page links to all target LMS routes', async ({ page }) => {
  await page.goto(`${APP_BASE_URL}/lms/school-routes`);

  await page.getByRole('link', { name: /organization management/i }).click();
  await expect(page).toHaveURL(/\/lms\/organization-management$/);

  await page.goto(`${APP_BASE_URL}/lms/school-routes`);
  await page.getByRole('link', { name: /school management/i }).click();
  await expect(page).toHaveURL(/\/lms\/school-management$/);

  await page.goto(`${APP_BASE_URL}/lms/school-routes`);
  await page.getByRole('link', { name: /student management/i }).click();
  await expect(page).toHaveURL(/\/lms\/student-management$/);

  await page.goto(`${APP_BASE_URL}/lms/school-routes`);
  await page.getByRole('link', { name: /exam management/i }).click();
  await expect(page).toHaveURL(/\/lms\/exam-management$/);
});

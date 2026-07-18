import { test, expect } from '@playwright/test';

const APP_BASE_URL = 'http://localhost:3000';

test('exam management supports dynamic builder actions', async ({ page }) => {
  await page.goto(`${APP_BASE_URL}/lms/exam-management`);

  await page.getByRole('button', { name: /add section/i }).click();
  await expect(page.getByText(/section 2/i)).toBeVisible();

  await page.getByRole('button', { name: /add question/i }).nth(1).click();
  await expect(page.getByText(/question 2/i).first()).toBeVisible();
});

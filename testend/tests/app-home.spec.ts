import { test, expect, type Page } from '@playwright/test';

const APP_BASE_URL = 'http://localhost:3000';

const homeCards = [
  { label: /f&o/i, expectedPath: /\/auth$/ },
  { label: /instruments/i, expectedPath: /\/auth$/ },
  { label: /auth/i, expectedPath: /\/auth$/ },
  { label: /admin/i, expectedPath: /\/auth$/ },
  { label: /incentive/i, expectedPath: /\/auth$/ },
  { label: /data collector/i, expectedPath: /\/auth$/ },
  { label: /lms/i, expectedPath: /\/auth$/ },
];

const routeExpectations = [
  { route: '/', heading: /auth/i, kind: 'button' as const },
  { route: '/auth', heading: /login fast, trade faster/i, kind: 'text' as const },
  { route: '/data-collector', heading: /available data collectors/i, kind: 'text' as const },
  { route: '/incentive', heading: /schemes/i, kind: 'tab' as const },
  { route: '/judwaa/admin', heading: /force logout/i, kind: 'link' as const },
  { route: '/judwaa/admin/security/forcelogout', heading: /force logout tokens/i, kind: 'text' as const },
  { route: '/lms', heading: /lms route hub/i, kind: 'text' as const },
  { route: '/lms/exam-management', heading: /exam management/i, kind: 'text' as const },
  { route: '/lms/organization-management', heading: /organization management/i, kind: 'text' as const },
  { route: '/lms/school-management', heading: /school management/i, kind: 'text' as const },
  { route: '/lms/school-routes', heading: /school routes/i, kind: 'text' as const },
  { route: '/lms/student-management', heading: /student management/i, kind: 'text' as const },
  { route: '/trading/calculator/stoploss', heading: /stoploss and p&l planner/i, kind: 'text' as const },
  { route: '/trading/f&o', heading: /positions/i, kind: 'tab' as const },
  { route: '/trading/instrument', heading: /instruments/i, kind: 'text' as const },
];

const expectRouteContent = async (
  page: Page,
  route: string,
  heading: RegExp,
  kind: 'text' | 'button' | 'link' | 'tab',
) => {
  await page.goto(`${APP_BASE_URL}${route}`);

  if (kind === 'button') {
    await expect(page.getByRole('button', { name: heading }).first()).toBeVisible();
    return;
  }

  if (kind === 'link') {
    await expect(page.getByRole('link', { name: heading }).first()).toBeVisible();
    return;
  }

  if (kind === 'tab') {
    await expect(page.getByRole('tab', { name: heading }).first()).toBeVisible();
    return;
  }

  await expect(page.getByText(heading).first()).toBeVisible();
};

test('home page shows app cards', async ({ page }) => {
  await page.goto(`${APP_BASE_URL}/`);

  await expect(page).toHaveTitle(/Judwaa/i);
  await expect(page.getByRole('button', { name: /auth/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /f&o/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /data collector/i })).toBeVisible();
});

test('protected card redirects to auth when not logged in', async ({ page }) => {
  await page.goto(`${APP_BASE_URL}/`);

  await page.getByRole('button', { name: /f&o/i }).click();
  await expect(page).toHaveURL(/\/auth$/);
});

test('full homepage e2e navigation coverage for all cards', async ({ page }) => {
  await page.goto(`${APP_BASE_URL}/`);

  await expect(page.getByRole('button')).toHaveCount(7);
  await expect(page.getByText(/members only/i)).toHaveCount(6);

  for (const card of homeCards) {
    await page.goto(`${APP_BASE_URL}/`);
    await page.getByRole('button', { name: card.label }).click();
    await expect(page).toHaveURL(card.expectedPath);
  }
});

test('all routes render core functional content', async ({ page }) => {
  for (const routeConfig of routeExpectations) {
    await expectRouteContent(page, routeConfig.route, routeConfig.heading, routeConfig.kind);
  }
});

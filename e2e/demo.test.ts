import { expect, test } from '@playwright/test';

test('home page has chart and table', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('canvas')).toBeVisible();
	await expect(page.locator('table')).toBeVisible();
});

import { test, expect } from '@playwright/test'

test('should navigate to the home page', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Workout log dev mode')
})


test('should create a workout log', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('exercise').fill('Squat');
    await page.getByLabel('reps').fill('10');
    await page.getByLabel('weight').fill('80');
    await page.locator("[type=submit]").click();

    await expect( page.getByRole('listitem').filter({ hasText: 'Squat' }).filter({hasText: '10'}).filter({hasText: '80'})).toBeVisible();
})
import {expect, test} from '@playwright/test'
import {HomePageHelper} from "@/e2e-tests/home-page-helper";

test('should navigate to the home page', async ({page}) => {
    const homePage = new HomePageHelper(page);
    await homePage.goto();
    await expect(homePage.title()).toContainText('Workout log dev mode')
})

test('should create a workout log', async ({page}) => {
    const homePage = new HomePageHelper(page);
    await homePage.goto();
    await homePage.submitWorkoutLog({
        exercise: 'Squat',
        reps: 10,
        weight: 80
    })
})
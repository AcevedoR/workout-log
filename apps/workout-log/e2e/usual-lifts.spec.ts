import { test, expect } from '@playwright/test'
import {HomePageHelper} from "./home-page-helper";
import {calculateUsualLift} from "../src/backend/usual-lift/usual-lifts";

test('should display a Usual lift', async ({ page }) => {
    const homePage = new HomePageHelper(page);
    await homePage.goto();

    await homePage.submitWorkoutLog({exercise: 'Squat', reps: 10, weight:60});
    await homePage.submitWorkoutLog({exercise: 'Squat', reps: 6, weight:80});
    await homePage.submitWorkoutLog({exercise: 'Other', reps: 19, weight:47});

    await calculateUsualLift();

    // await expect(homePage.usualLift()).toBeVisible(); TODO
    // console.log("debug locator: ", homePage.usualLift());
})
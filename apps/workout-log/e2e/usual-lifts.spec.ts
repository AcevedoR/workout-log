import {expect, test} from '@playwright/test'
import {HomePageHelper} from "./home-page-helper";

test('should display a Usual lift', async ({page}) => {
    // TODO clear data in beforeEach

    const homePage = new HomePageHelper(page);
    await homePage.goto();

    await homePage.submitWorkoutLog({exercise: 'Other', reps: 19, weight: 47});
    await homePage.submitWorkoutLog({exercise: 'Squat', reps: 10, weight: 60});
    await homePage.submitWorkoutLog({exercise: 'Squat', reps: 6, weight: 80});
    await homePage.submitWorkoutLog({exercise: 'Squat', reps: 5, weight: 80});
    await homePage.submitWorkoutLog({exercise: 'Squat', reps: 4, weight: 80});

    await fetch('http://127.0.0.1:5001/workout-log-424900/us-central1/calculate').catch(error => console.error(error))

    await homePage.page.reload();

    await expect(homePage.usualLift()).toBeVisible({timeout: 5000});
    console.log("debug locator: ", homePage.usualLift());
})

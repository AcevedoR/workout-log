import {expect, test} from '@playwright/test'
import {HomePageHelper} from "./home-page-helper";

// TODO clear data in beforeEach

test('should display a Usual lift', async ({page}) => {
    await test.step('Given Dev user was active today', async () => {
        await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCeV1giwlkriJuW3MU-w1jHQCf0NpJHvy0',
            {
                method: 'POST',
                body: JSON.stringify({
                    "email": "dev-mode-fake-user@toto.com",
                    "password": "dev-mode-fake-user"
                })
            })
            .catch(error => console.error(error))
    });

    const homePage = new HomePageHelper(page);
    await test.step('When Dev user enters a workout', async () => {
        await homePage.goto();

        await homePage.submitWorkoutLog({exercise: 'Other', reps: 19, weight: 47});
        await homePage.submitWorkoutLog({exercise: 'Squat', reps: 10, weight: 60});
        await homePage.submitWorkoutLog({exercise: 'Squat', reps: 6, weight: 80});
        await homePage.submitWorkoutLog({exercise: 'Squat', reps: 5, weight: 80});
        await homePage.submitWorkoutLog({exercise: 'Squat', reps: 4, weight: 80});
    });

    await test.step('And he waits a day for the statistics to be calculated', async () => {
        await fetch('http://127.0.0.1:5001/workout-log-424900/us-central1/calculate').catch(error => console.error(error))
    });

    await test.step('Then, the next time he go into the app, the UsualLift for this move was calculated', async () => {
        await homePage.page.reload();

        await expect(homePage.usualLift()).toBeVisible({timeout: 5000});
    });
})

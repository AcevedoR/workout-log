import {expect, type Locator, type Page} from '@playwright/test';

export class HomePageHelper {
    readonly page: Page;
    readonly getStartedLink: Locator;
    readonly gettingStartedHeader: Locator;
    readonly pomLink: Locator;
    readonly tocList: Locator;

    constructor(page: Page) {
        this.page = page;
        this.getStartedLink = page.locator('a', {hasText: 'Get started'});
        this.gettingStartedHeader = page.locator('h1', {hasText: 'Installation'});
        this.pomLink = page.locator('li', {
            hasText: 'Guides',
        }).locator('a', {
            hasText: 'Page Object Model',
        });
        this.tocList = page.locator('article div.markdown ul > li > a');
    }

    async goto() {
        await this.page.goto('/');
    }

    title(): Locator {
        return this.page.locator('h1');
    }

    usualLift(): Locator {
        return this.page.getByText('Usual lift');
    }

    async submitWorkoutLog(workoutInput: { exercise: string, reps: number, weight: number }) {
        await this.page.getByLabel('exercise').fill(workoutInput.exercise);
        await this.page.getByLabel('reps').fill(workoutInput.reps.toString());
        await this.page.getByLabel('weight').fill(workoutInput.weight.toString());
        await this.page.locator("[type=submit]").click();

        await expect(this.page.getByRole('listitem').filter({hasText: workoutInput.exercise}).filter({hasText: workoutInput.reps.toString()}).filter({hasText: workoutInput.weight.toString()})).toBeVisible();
    }
}
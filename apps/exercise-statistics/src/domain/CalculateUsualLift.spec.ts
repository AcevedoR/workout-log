import {describe, expect, it} from "vitest";
import {calculateUsualLift} from "./CalculateUsualLift";
import {UsualLiftRange} from "../../../workout-log/src/app/model/usual-lift";

describe('calculateUsualLift test', () => {
    it('usualLift cannot be calculated with too few data', () => {
        expect(
            calculateUsualLift(
                [
                    {
                        exercise: "Squat",
                        date: 1,
                        reps: 10,
                        weight: 60
                    },
                    {
                        exercise: "Squat",
                        date: 2,
                        reps: 6,
                        weight: 80
                    }
                ]
            )
        ).toBeNull();
    })
    it('usualLift should work on the minimum case', () => {
        expect(
            calculateUsualLift(
                [
                    {
                        exercise: "Squat",
                        date: 1,
                        reps: 10,
                        weight: 60
                    },
                    {
                        exercise: "Squat",
                        date: 2,
                        reps: 6,
                        weight: 80
                    },
                    {
                        exercise: "Squat",
                        date: 3,
                        reps: 6,
                        weight: 80
                    }
                ]
            )
        ).toEqual({
            exercise: "Squat",
            reps: 6,
            weight: 80
        });
    })
    it('usualLift should work on my personal use case', () => {
        expect(
            calculateUsualLift(
                [
                    {
                        exercise: "Squat",
                        date: 1,
                        reps: 10,
                        weight: 60
                    },
                    {
                        exercise: "Squat",
                        date: 2,
                        reps: 6,
                        weight: 80
                    },
                    {
                        exercise: "Squat",
                        date: 3,
                        reps: 6,
                        weight: 80
                    },
                    {
                        exercise: "Squat",
                        date: 3,
                        reps: 5,
                        weight: 80
                    }
                ]
            )
        ).toEqual({
            exercise: "Squat",
            reps: 6,
            weight: 80
        });
    })
    it('usualLift should work on my personal case 2: usual high lift', () => {
        expect(
            calculateUsualLift(
                [
                    {
                        exercise: "Deadlift",
                        date: 1,
                        reps: 10,
                        weight: 60
                    },
                    {
                        exercise: "Deadlift",
                        date: 2,
                        reps: 6,
                        weight: 80
                    },
                    {
                        exercise: "Deadlift",
                        date: 3,
                        reps: 6,
                        weight: 100
                    },
                    {
                        exercise: "Deadlift",
                        date: 4,
                        reps: 5,
                        weight: 100
                    },
                    {
                        exercise: "Deadlift",
                        date: 5,
                        reps: 5,
                        weight: 100
                    },
                    {
                        exercise: "Deadlift",
                        date: 6,
                        reps: 5,
                        weight: 100
                    }
                ]
            )
        ).toEqual({
            exercise: "Deadlift",
            reps: new UsualLiftRange(5, 6),
            weight: 100
        });
    })
    it('usualLift should work on my personal case 3: attempting PB', () => {
        expect(
            calculateUsualLift(
                [
                    {
                        exercise: "Deadlift",
                        date: 1,
                        reps: 10,
                        weight: 60
                    },
                    {
                        exercise: "Deadlift",
                        date: 2,
                        reps: 6,
                        weight: 80
                    },
                    {
                        exercise: "Deadlift",
                        date: 3,
                        reps: 6,
                        weight: 80
                    },
                    {
                        exercise: "Deadlift",
                        date: 4,
                        reps: 6,
                        weight: 80
                    },
                    {
                        exercise: "Deadlift",
                        date: 5,
                        reps: 3,
                        weight: 100
                    },
                    {
                        exercise: "Deadlift",
                        date: 6,
                        reps: 2,
                        weight: 120
                    },
                    {
                        exercise: "Deadlift",
                        date: 7,
                        reps: 1,
                        weight: 125
                    },
                    {
                        exercise: "Deadlift",
                        date: 8,
                        reps: 1,
                        weight: 130
                    }
                ]
            )
        ).toEqual({
            exercise: "Deadlift",
            reps: 6,
            weight: 80
        });
    })
})
import {Workout} from "../../../workout-log/src/app/workout";
import {UsualLift, UsualLiftRange} from "../../../workout-log/src/app/model/usual-lift";

const WORKOUT_MINIMUM_COUNT_REQUIRED_FOR_CALCULUS = 3;


export function calculateUsualLift(workouts: Workout[]): UsualLift | null {
    try {
        workouts = workouts.filter(x => x.reps >= 3);

        if (workouts.length < WORKOUT_MINIMUM_COUNT_REQUIRED_FOR_CALCULUS) {
            return null;
        }

        if (workouts.length % 2 == 0) {
            const one = workouts[workouts.length / 2 - 1];
            const two = workouts[workouts.length / 2];

            if (isGreater(one, two)) {
                return fromWorkout(one);
            }
            if (isGreater(two, one)) {
                return fromWorkout(two);
            }

            if (one.reps == two.reps) {
                return {
                    exercise: one.exercise,
                    reps: one.reps,
                    weight: roundToTwo((one.weight + two.weight) / 2)
                }
            } else if (one.weight == two.weight) {
                let repsRange: UsualLiftRange;
                if (one.reps < two.reps) {
                    repsRange = new UsualLiftRange(one.reps, two.reps);
                } else {
                    repsRange = new UsualLiftRange(two.reps, one.reps);
                }
                return {
                    exercise: one.exercise,
                    reps: repsRange,
                    weight: one.weight
                }
            } else {
                throw new Error("should not happen");
            }
        } else {
            let x = workouts[(workouts.length - 1) / 2];
            return fromWorkout(x)
        }
    } catch (error) {
        console.error(`there was an error while calculating usualLift, workouts: ${JSON.stringify(workouts)}, error:`, error)
    }
    return null;
}

function fromWorkout(x: Workout) {
    return {
        exercise: x.exercise,
        reps: x.reps,
        weight: x.weight
    };
}

function isGreater(one: Workout, two: Workout) {
    return one.reps > two.reps && one.weight > two.weight;
}

function roundToTwo(num: number): number {
    return Number(num.toFixed(2));
}
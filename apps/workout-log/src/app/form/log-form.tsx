import React, {FocusEvent, useState} from "react";
import {Workout} from "../workout";
import {noop} from "../noop";

interface LogFormProps {
    onWorkoutLog?: (e: { workout: Workout }) => void;
    onExerciseSelected?: (e: { exercise: string }) => void;
    lastWorkoutInput: Workout | undefined;
}

export default function LogForm(props: LogFormProps) {
    const {onWorkoutLog = noop, onExerciseSelected = noop, lastWorkoutInput} = props;

    const [exercise, setExercise] = useState(lastWorkoutInput ? lastWorkoutInput.exercise : "deadlift");
    const [reps, setReps] = useState(lastWorkoutInput ? lastWorkoutInput.reps : 10);
    const [weight, setWeight] = useState(lastWorkoutInput ? lastWorkoutInput.weight : 80);

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const onExerciseChange = (exercise: string) => {
        setExercise(exercise);
        if(exercise.length > 2){
            onExerciseSelected({exercise});
        }
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        lastFocusEvent?.target.blur();
        if (document && document.activeElement) {
            try {
                const activeElement = document.activeElement as HTMLElement;
                activeElement.blur();
            } catch (e) {
                console.error("could not blur activeElement because: " + e);
            }
        }
        setIsLoading(true)
        setError(null) // Clear previous errors when a new request starts

        try {
            onWorkoutLog({
                workout: {
                    exercise,
                    reps,
                    weight,
                    date: Date.now()
                }
            });

            await new Promise(r => setTimeout(r, 200));
        } catch (error: any) {
            // Capture the error message to display to the user
            setError(error.message)
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    };

    const selectAllInputOnFocus = (e: FocusEvent<HTMLInputElement>): void => {
        lastFocusEvent = e;
        e.target.select();
    }

    let lastFocusEvent: FocusEvent<HTMLInputElement> | undefined = undefined;

    return (
        <form
            className='log-form flex flex-col items-center border-b border-gray-900/10 pb-6  gap-x-6 gap-y-8 sm:grid-cols-6'
            onSubmit={(e) => onSubmit(e)}
        >
            {error && <div style={{color: 'red'}}>{error}</div>}

            <div className="form-element col-span-full mt-2">
                <label className="block text-sm font-medium leading-6" htmlFor="exercise">Exercise</label>
                <input
                    type="text"
                    name="exercise"
                    id="exercise"
                    list="defaultExercices"
                    value={exercise}
                    onChange={(e) =>
                        onExerciseChange(e.target.value)
                    }
                    onFocus={selectAllInputOnFocus}
                    required
                />
                <datalist id="defaultExercices">
                    <option value="deadlift"></option>
                    <option value="squat"></option>
                    <option value="bench press"></option>
                    <option value="biceps curl"></option>
                </datalist>
            </div>
            <div className={"form-element"}>
                <label className="block text-sm font-medium leading-6" htmlFor="reps">Reps</label>
                <input
                    type="number"
                    name="reps"
                    id="reps"
                    value={reps}
                    onChange={(e) =>
                        setReps(Number.parseInt(e.target.value))
                    }
                    onFocus={selectAllInputOnFocus}
                    required
                />
            </div>
            <div className={"form-element"}>
                <label htmlFor="weight" className="block text-sm font-medium leading-6">Weight</label>
                <input
                    type="number"
                    name="weight"
                    id="weight"
                    value={weight}
                    step="0.25"
                    onChange={(e) =>
                        setWeight(Number.parseFloat(e.target.value))
                    }
                    onFocus={selectAllInputOnFocus}
                    required
                />
            </div>
            <div className={"form-element content-center"}>
                <button
                    className="rounded-md bg-main px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-main/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    type="submit"
                    value="Submit"
                    disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Submit'}
                </button>
            </div>
        </form>
    );
}

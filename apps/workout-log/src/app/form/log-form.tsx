import React, {FocusEvent, useState} from "react";
import {Workout} from "../workout";
import {noop} from "../noop";
import {sanitizeRpe} from "../model/rpe";
import RpeSelector from "./rpe-selector";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClockRotateLeft} from "@fortawesome/free-solid-svg-icons";

interface LogFormProps {
    onWorkoutLog?: (e: { workout: Workout }) => void;
    onExerciseSelected?: (e: { exercise: string }) => void;
    lastWorkoutInput: Workout | undefined;
    onShowExerciseHistory?: () => void;
    canShowExerciseHistory?: boolean;
}

export default function LogForm(props: LogFormProps) {
    const {
        onWorkoutLog = noop,
        onExerciseSelected = noop,
        lastWorkoutInput,
        onShowExerciseHistory = noop,
        canShowExerciseHistory = false,
    } = props;

    const [exercise, setExercise] = useState(lastWorkoutInput ? lastWorkoutInput.exercise : "deadlift");
    const [reps, setReps] = useState(lastWorkoutInput ? lastWorkoutInput.reps : 10);
    const [weight, setWeight] = useState(lastWorkoutInput ? lastWorkoutInput.weight : 80);
    // RPE is optional and set-specific, so it always starts blank rather than carrying over.
    const [rpe, setRpe] = useState<number | undefined>(undefined);

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
                    date: Date.now(),
                    rpe: sanitizeRpe(rpe)
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

    const floatingInput = "peer w-full rounded-md border-gray-300 px-3 pt-5 pb-1 text-base focus:border-main focus:ring-main";
    const floatingLabel = "pointer-events-none absolute left-3 top-1 text-xs font-medium text-gray-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-main";

    return (
        <form
            className='log-form flex flex-col items-stretch w-full max-w-sm mx-auto border-b border-gray-900/10 pb-4 gap-y-3'
            onSubmit={(e) => onSubmit(e)}
        >
            {error && <div style={{color: 'red'}}>{error}</div>}

            <div className="form-element relative mt-2">
                <input
                    type="text"
                    name="exercise"
                    id="exercise"
                    list="defaultExercices"
                    placeholder=" "
                    className={floatingInput}
                    value={exercise}
                    onChange={(e) =>
                        onExerciseChange(e.target.value)
                    }
                    onFocus={selectAllInputOnFocus}
                    required
                />
                <label className={floatingLabel} htmlFor="exercise">Exercise</label>
                <datalist id="defaultExercices">
                    <option value="deadlift"></option>
                    <option value="squat"></option>
                    <option value="bench press"></option>
                    <option value="biceps curl"></option>
                </datalist>
            </div>
            <div className="flex flex-row gap-3">
                <div className="form-element relative flex-1">
                    <input
                        type="number"
                        name="reps"
                        id="reps"
                        placeholder=" "
                        className={floatingInput}
                        value={reps}
                        onChange={(e) =>
                            setReps(Number.parseInt(e.target.value))
                        }
                        onFocus={selectAllInputOnFocus}
                        required
                    />
                    <label className={floatingLabel} htmlFor="reps">Reps</label>
                </div>
                <div className="form-element relative flex-1">
                    <input
                        type="number"
                        name="weight"
                        id="weight"
                        placeholder=" "
                        className={floatingInput}
                        value={weight}
                        step="0.25"
                        onChange={(e) =>
                            setWeight(Number.parseFloat(e.target.value))
                        }
                        onFocus={selectAllInputOnFocus}
                        required
                    />
                    <label htmlFor="weight" className={floatingLabel}>Weight</label>
                </div>
            </div>
            <div className="form-element w-full">
                <label htmlFor="rpe-selector" className="block text-sm font-medium leading-6">
                    RPE <span className="text-xs font-normal text-gray-400">(optional)</span>
                </label>
                <RpeSelector value={rpe} onChange={setRpe}/>
            </div>
            <div className="form-element content-center flex flex-row items-center justify-center gap-3">
                <button
                    className="rounded-md bg-main px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-main/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    type="submit"
                    value="Submit"
                    disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Submit'}
                </button>
                {canShowExerciseHistory ?
                    <button
                        type="button"
                        onClick={onShowExerciseHistory}
                        title="Exercise history"
                        aria-label="Exercise history"
                        className="rounded-md border border-main px-3 py-2 text-sm font-semibold text-main shadow-sm hover:bg-main/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        <FontAwesomeIcon icon={faClockRotateLeft}/>
                    </button>
                    : <></>
                }
            </div>
        </form>
    );
}

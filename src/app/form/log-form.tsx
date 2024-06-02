import React, {useState} from "react";
import {log} from "@/app/workout-log-api";

export default function LogForm() {
    const [exercise, setExercise] = useState("deadlift");
    const [reps, setReps] = useState(10);
    const [weight, setWeight] = useState(80);

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const onSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsLoading(true)
        setError(null) // Clear previous errors when a new request starts

        try {
            await log({exercise, reps, weight})
                .then(res => console.log('saved'));
            await new Promise(r => setTimeout(r, 500));
        } catch (error: any) {
            // Capture the error message to display to the user
            setError(error.message)
            console.error(error)
        } finally {
            setIsLoading(false)
        }

    };
    return (
        <form className='log-form flex flex-col items-center border-b border-gray-900/10 pb-12 mt-10 gap-x-6 gap-y-8 sm:grid-cols-6'>
            {error && <div style={{color: 'red'}}>{error}</div>}

            <div className="form-element col-span-full mt-2">
                <label className="block text-sm font-medium leading-6" htmlFor="exercise">Exercise</label>
                <input
                    type="text"
                    name="exercise"
                    id="exercise"
                    value={exercise}
                    onChange={(e) =>
                        setExercise(e.target.value)
                    }
                    required
                />
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
                    onChange={(e) =>
                        setWeight(Number.parseInt(e.target.value))
                    }
                    required
                />
            </div>
            <div className={"form-element content-center"}>
                <button
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    type="submit"
                    value="Submit"
                    disabled={isLoading}
                    onClick={(e) => onSubmit(e)}
                >
                    {isLoading ? 'Loading...' : 'Submit'}
                </button>
            </div>
        </form>
    );
}

import {describe, expect, it} from 'vitest'
import {WorkoutRow} from "../workout";
import {classifySessionSets} from "./set-intensity";

function row(id: string, weight: number, overrides?: { exercise?: string, reps?: number }): WorkoutRow {
    return {
        id,
        value: {
            exercise: overrides?.exercise ?? "Trap bar deadlift",
            reps: overrides?.reps ?? 8,
            weight,
            date: 0,
        }
    };
}

describe('classifySessionSets', () => {
    it('returns an empty classification for no sets', () => {
        expect(classifySessionSets([]).size).toEqual(0);
    })

    it('marks the only set as working', () => {
        const map = classifySessionSets([row("1", 100)]);

        expect(map.get("1")).toEqual("working");
    })

    it('marks the top-weight sets working and the lighter ramp-up sets as warmup', () => {
        // ordered most-recent-first, like a rendered session
        const sets = [
            row("5", 100),
            row("4", 100),
            row("3", 100),
            row("2", 80),
            row("1", 60),
        ];

        const map = classifySessionSets(sets);

        expect(map.get("5")).toEqual("working");
        expect(map.get("4")).toEqual("working");
        expect(map.get("3")).toEqual("working");
        expect(map.get("2")).toEqual("warmup");
        expect(map.get("1")).toEqual("warmup");
    })

    it('treats every set as working when they all share the same weight', () => {
        const sets = [row("2", 67.5), row("1", 67.5)];

        const map = classifySessionSets(sets);

        expect(map.get("2")).toEqual("working");
        expect(map.get("1")).toEqual("working");
    })

    it('classifies each exercise independently within the same session', () => {
        // a deadlift working weight must not make a lighter bench press look like a warmup
        const sets = [
            row("4", 100, {exercise: "Trap bar deadlift"}),
            row("3", 60, {exercise: "Trap bar deadlift"}),
            row("2", 67.5, {exercise: "Barred bench press"}),
            row("1", 60, {exercise: "Barred bench press"}),
        ];

        const map = classifySessionSets(sets);

        expect(map.get("4")).toEqual("working"); // deadlift top
        expect(map.get("3")).toEqual("warmup");  // deadlift ramp-up
        expect(map.get("2")).toEqual("working"); // bench top, despite being lighter than the deadlift
        expect(map.get("1")).toEqual("warmup");  // bench ramp-up
    })
})

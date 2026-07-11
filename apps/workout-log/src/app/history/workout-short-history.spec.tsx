import {afterEach, describe, expect, it} from 'vitest'
import {cleanup, render} from '@testing-library/react'
import React from "react";
import WorkoutShortHistory from "./workout-short-history";
import {WorkoutRow} from "../workout";

function row(id: string, date: Date, sessionId?: string): WorkoutRow {
    return {id, value: {exercise: "Squat", reps: 5, weight: 80, date: date.valueOf(), sessionId}};
}

afterEach(() => cleanup());

describe('WorkoutShortHistory session grouping', () => {
    it('renders every workout, split across one session block per gym visit', () => {
        const workouts = [
            // today's session
            row("4", new Date("2024-07-13T18:20:00")),
            row("3", new Date("2024-07-13T18:00:00")),
            // yesterday's session
            row("2", new Date("2024-07-12T09:20:00")),
            row("1", new Date("2024-07-12T09:00:00")),
        ];

        const {container} = render(<WorkoutShortHistory workoutList={workouts}/>);

        expect(container.querySelectorAll('#workout-session')).toHaveLength(2);
        expect(container.querySelectorAll('#workout-history-entry')).toHaveLength(4);
    })

    it('renders one block per persisted sessionId, even for close-in-time logs', () => {
        const workouts = [
            row("2", new Date("2024-07-13T10:20:00"), "session-B"),
            row("1", new Date("2024-07-13T10:00:00"), "session-A"),
        ];

        const {container} = render(<WorkoutShortHistory workoutList={workouts}/>);

        expect(container.querySelectorAll('#workout-session')).toHaveLength(2);
        expect(container.querySelectorAll('#workout-history-entry')).toHaveLength(2);
    })

    it('keeps a single close-in-time visit in one session block', () => {
        const workouts = [
            row("2", new Date("2024-07-13T10:20:00")),
            row("1", new Date("2024-07-13T10:00:00")),
        ];

        const {container} = render(<WorkoutShortHistory workoutList={workouts}/>);

        expect(container.querySelectorAll('#workout-session')).toHaveLength(1);
        expect(container.querySelectorAll('#workout-history-entry')).toHaveLength(2);
    })

    it('renders nothing but the heading when there is no workout', () => {
        const {container} = render(<WorkoutShortHistory workoutList={[]}/>);

        expect(container.querySelectorAll('#workout-session')).toHaveLength(0);
        expect(container.querySelectorAll('#workout-history-entry')).toHaveLength(0);
    })
})

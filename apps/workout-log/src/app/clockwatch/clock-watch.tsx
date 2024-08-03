'use client'
import React, {forwardRef, Ref, useEffect, useImperativeHandle, useState} from "react";
import {getDateDiffInSecondsAndMinutes} from "../utils/date-utils";

export interface ClockWatchRef {
    resetClockWatch: () => void
}

export interface ClockWatchProps {
    getLastWorkoutDate: () => number | undefined
}

function getReferenceDate(lastWorkoutDate: number | undefined) {
    if (lastWorkoutDate) {
        return lastWorkoutDate;
    } else {
        return new Date();
    }
}

export const ClockWatch = forwardRef((props: ClockWatchProps, ref: Ref<ClockWatchRef>) => {
    const {getLastWorkoutDate} = props;

    const [timeToDisplay, setTimeToDisplay] = useState("");
    const [date, setDate] = useState<Date>(new Date(getReferenceDate(getLastWorkoutDate())));
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
    ClockWatch.displayName = 'ClockWatch';

    const resetClockWatch = () => {
        if (intervalId) {
            clearInterval(intervalId)

            const lastWorkoutDate = getLastWorkoutDate();// hack to always have this value up to date

            setDate(new Date(getReferenceDate(lastWorkoutDate)))
        }
    };

    useImperativeHandle(ref, () => ({
        resetClockWatch,
    }));

    useEffect(() => {
        const id = setInterval(() => {
            const {seconds, minutes} = getDateDiffInSecondsAndMinutes(new Date(), date);

            const currentTime = minutes + ' : ' + seconds;
            setTimeToDisplay(currentTime);
        }, 1000)
        setIntervalId(id)
        return () => clearInterval(id);
    }, [date])

    return (
        <div className="flex flex-row justify-center items-center pt-2 text-xl">
            <div>{timeToDisplay}</div>
        </div>
    );
});
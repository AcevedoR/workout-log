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
export function displayClockWatch(startDate: Date): {seconds: number, minutes: number} | null {
    let dateDiffInSecondsAndMinutes = getDateDiffInSecondsAndMinutes(new Date(), startDate);
    if(dateDiffInSecondsAndMinutes.minutes >= 60){
        return null
    } else {
        return dateDiffInSecondsAndMinutes;
    }
}

export const ClockWatch = forwardRef((props: ClockWatchProps, ref: Ref<ClockWatchRef>) => {
    const {getLastWorkoutDate} = props;

    const [timeToDisplay, setTimeToDisplay] = useState<string | null>(null);
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
            const timeToDisplayInMinutesAndSeconds = displayClockWatch(date);
            if(timeToDisplayInMinutesAndSeconds) {

                const {seconds, minutes} = timeToDisplayInMinutesAndSeconds;

                const currentTime = minutes + ' : ' + seconds;
                setTimeToDisplay(currentTime);
            } else {
                setTimeToDisplay(null);
            }
        }, 1000)
        setIntervalId(id)
        return () => clearInterval(id);
    }, [date])

    return (
        <div className="flex flex-row justify-center items-center pt-2 text-xl">
            {timeToDisplay ?
                <div data-testid="custom-element" role={"meter"}>{timeToDisplay}</div> : <></>
            }
        </div>
    );
});
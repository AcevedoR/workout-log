'use client'
import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";

export const ClockWatch = forwardRef((props, ref) => {
    const [timeToDisplay, setTimeToDisplay] = useState("");
    const [date, setDate] = useState(new Date("1968-11-16T00:00:00"));
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
    ClockWatch.displayName = 'ClockWatch';

    const resetClockWatch = () => {
        if (intervalId) {
            clearInterval(intervalId)
            setDate(new Date("1968-11-16T00:00:00"))
        }
    };

    useImperativeHandle(ref, () => ({
        resetClockWatch: () => resetClockWatch(),
    }));


    useEffect(() => {
        const id = setInterval(() => {
            date.setSeconds(date.getSeconds() + 1)
            setDate(date);
            const minute = date.getMinutes()
            const second = date.getSeconds()
            const currentTime = minute + ' : ' + second
            setTimeToDisplay(currentTime)
        }, 1000)
        setIntervalId(id)
        return () => clearInterval(id);
    }, [date])

    return (
        <div className="flex flex-row justify-center items-center pt-4 text-xl">
            <div>{timeToDisplay}</div>
        </div>
    );
});
'use client'

import React, {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faStopwatch} from "@fortawesome/free-solid-svg-icons";
import {formatDurationShort} from "../utils/date-utils";

export interface SessionDurationProps {
    // First set of the session the user is currently in (epoch ms).
    sessionStartDate: number
}

// Session length only matters to the minute, so there is no point re-rendering every second.
const REFRESH_INTERVAL_IN_MS = 15 * 1000;

/**
 * How long the current gym session has been running, shown next to the rest timer.
 * Rendered smaller and more transparent than the timer on purpose: the timer is what the user acts on
 * between sets, the session length is just ambient context.
 */
export default function SessionDuration(props: SessionDurationProps) {
    const {sessionStartDate} = props;

    const [durationInMs, setDurationInMs] = useState<number>(() => Date.now() - sessionStartDate);

    useEffect(() => {
        setDurationInMs(Date.now() - sessionStartDate);
        const id = setInterval(() => setDurationInMs(Date.now() - sessionStartDate), REFRESH_INTERVAL_IN_MS);
        return () => clearInterval(id);
    }, [sessionStartDate]);

    return (
        <div className="inline-flex items-center gap-1 text-sm text-main/50"
             data-testid="session-duration"
             title="Time since the first set of this session"
             aria-label={`Current session lasting ${formatDurationShort(durationInMs)}`}>
            <FontAwesomeIcon icon={faStopwatch} className="text-xs"/>
            <span>{formatDurationShort(durationInMs)}</span>
        </div>
    );
}

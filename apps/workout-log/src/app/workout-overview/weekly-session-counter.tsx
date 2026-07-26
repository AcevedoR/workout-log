import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDumbbell} from "@fortawesome/free-solid-svg-icons";
import {WorkoutRow} from "../workout";
import {countSessionsThisWeek} from "../history/workout-session";

interface WeeklySessionCounterProps {
    workoutList: WorkoutRow[];
}

/**
 * Compact badge showing how many gym sessions have been logged in the current week (Monday→Sunday).
 * Kept intentionally small — just a dumbbell icon and the count.
 */
export default function WeeklySessionCounter(props: WeeklySessionCounterProps) {
    const {workoutList} = props;
    const count = countSessionsThisWeek(workoutList);

    return (
        <div
            className="inline-flex items-center gap-1.5 rounded-full bg-main/10 px-2.5 py-1 text-sm font-semibold text-main"
            title={`${count} workout session${count === 1 ? "" : "s"} this week (Mon–Sun)`}
            aria-label={`${count} workout sessions this week`}>
            <FontAwesomeIcon icon={faDumbbell} className="text-xs"/>
            <span>{count}</span>
            <span className="text-xs font-normal text-main/70">this week</span>
        </div>
    );
}

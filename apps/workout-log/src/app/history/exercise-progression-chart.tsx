'use client'


import React from "react";
import {Workout} from "../workout";
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";

export interface ExerciseProgressionChartProps {
    workoutList: Workout[]
}

export interface ExerciseWeight {
    date: string,
    weight: number
}

export default function ExerciseProgressionChart(props: ExerciseProgressionChartProps) {
    const {workoutList} = props;
    const exerciseWeights: ExerciseWeight[] = workoutList
        .sort((a, b) => a.date - b.date)
        .map(x => {
                return {
                    date: new Date(x.date).toLocaleDateString(),
                    weight: x.weight
                };
            }
        );

    const maxWeightBySession: ExerciseWeight[] = Object.entries(Object.groupBy(exerciseWeights, ({date}) => date))
        .map(([date, exerciseWeights]) => {
            if (!exerciseWeights) {
                throw new Error("when calculating the max weight of a session, we should always have weights");
            }
            return {date: date, weight: Math.max(...exerciseWeights.map(x => x.weight))}
        });


    function getMostDoneWeight(weights: number[]): number | null {
        const weightOccurences: Record<number, number> = weights.reduce((acc: Record<number, number>, num: number) => {
            acc[num] = (acc[num] || 0) + 1;
            return acc;
        }, {});

        let w = Object.entries(weightOccurences)
            .filter(([weight, occurence]) => occurence > 2)
            .sort((a, b) => b[1] - a[1])
            .sort((a, b) => Number(b[0]) - Number(a[0]));
        if (!w || w.length == 0) {
            return null
        } else {
            return Number(w[0][0]);
        }
    }

    let weigthsForSessionWithMoreThan3Series = Object.entries(Object.groupBy(exerciseWeights, ({date}) => date))
        .filter(([date, exerciseWeights]) => exerciseWeights && exerciseWeights.length >= 3);
    const usualTrainingWeightBySession: ExerciseWeight[] = weigthsForSessionWithMoreThan3Series
        .map(([date, exerciseWeights]) => {
            if (!exerciseWeights) {
                throw new Error("when calculating the max weight of a session, we should always have weights");
            }
            return {date: date, weight: getMostDoneWeight(exerciseWeights.map(x => x.weight))} as ExerciseWeight
        }).filter(exerciseWeight => exerciseWeight.weight != null);

    return (
        <div>
            {
                !exerciseWeights || exerciseWeights.length == 0 ? <></>
                    :
                    <div className="h-60 mb-4">
                        <h2>All data</h2>
                        <ResponsiveContainer>
                            <LineChart
                                width={500}
                                height={300}
                                data={exerciseWeights}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="date"/>
                                <YAxis domain={["dataMin-20", 'dataMax']}/>
                                <Tooltip/>
                                <Legend/>
                                <Line type="monotone" dataKey="weight" stroke="#8884d8" activeDot={{r: 8}}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
            }
            {!maxWeightBySession || maxWeightBySession.length == 0 ? <></>
                :
                <div className="h-60 mb-4">
                    <h2>Max Weight by session</h2>
                    <ResponsiveContainer>

                        <LineChart
                            width={500}
                            height={300}
                            data={maxWeightBySession}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="date"/>
                            <YAxis domain={["dataMin-20", 'dataMax']}/>
                            <Tooltip/>
                            <Legend/>
                            <Line type="monotone" dataKey="weight" stroke="#8884d8" activeDot={{r: 8}}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            }
            {
                !usualTrainingWeightBySession || usualTrainingWeightBySession.length == 0 ? <></>
                    :
                    <div className="h-60 mb-4">
                        <h2>Usual Weight by session</h2>
                        <ResponsiveContainer>

                            <LineChart
                                width={500}
                                height={300}
                                data={usualTrainingWeightBySession}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="date"/>
                                <YAxis domain={["dataMin-20", 'dataMax']}/>
                                <Tooltip/>
                                <Legend/>
                                <Line type="monotone" dataKey="weight" stroke="#8884d8" activeDot={{r: 8}}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
            }
        </div>
    );

}

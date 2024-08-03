import React from "react";
import {UsualLift} from "../model/usual-lift";

interface UsualLiftWidgetProps {
    usualLift: UsualLift;
}

export default function UsualLiftWidget(props: UsualLiftWidgetProps) {
    const {usualLift} = props;

    return (
        <div className="block border-solid border-2 border-gray-400 p-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <h3>Usual lift</h3>
            <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-2">
                    <div className="inline-flex items-center text-base font-semibold text-gray-900">
                        {usualLift.reps}
                    </div>
                    <div className="inline-flex items-center text-base font-semibold text-gray-900">
                        x
                    </div>
                    <div className="inline-flex items-center text-base font-semibold text-gray-900">
                        {usualLift.weight}
                        <p className="text-gray-500 text-sm">kg</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

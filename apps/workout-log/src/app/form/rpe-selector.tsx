import React from "react";
import {RPE_VALUES, rpeColor} from "../model/rpe";

interface RpeSelectorProps {
    value: number | undefined;
    onChange: (rpe: number | undefined) => void;
}

/**
 * Optional RPE picker: ten colour-coded buttons on a grey→green→yellow→red effort scale.
 * Tapping the selected value again clears it, since RPE is optional.
 */
export default function RpeSelector({value, onChange}: RpeSelectorProps) {
    return (
        <div id="rpe-selector" role="group" aria-label="RPE" className="flex flex-row gap-1 w-full">
            {RPE_VALUES.map((n) => {
                const selected = value === n;
                return (
                    <button
                        key={n}
                        type="button"
                        aria-label={`RPE ${n}`}
                        aria-pressed={selected}
                        title={`RPE ${n}`}
                        onClick={() => onChange(selected ? undefined : n)}
                        style={{backgroundColor: rpeColor(n)}}
                        className={`flex-1 h-8 rounded text-xs font-semibold text-black/70 transition-transform ${
                            selected ? "ring-2 ring-offset-1 ring-gray-600 scale-110" : "opacity-40 hover:opacity-70"
                        }`}
                    >
                        {n}
                    </button>
                );
            })}
        </div>
    );
}

import React, {useEffect, useMemo, useRef, useState} from "react";
import {normalizeExercise} from "../model/exercise";
import {ExerciseSuggestion, KnownExercise, searchExercises} from "../model/exercise-suggestions";

interface ExerciseComboboxProps {
    value: string;
    /** Fires on every keystroke with the raw typed value. */
    onChange: (value: string) => void;
    /** Fires when a value is committed (suggestion picked or field left) with the canonical name. */
    onCommit?: (value: string) => void;
    /** The user's already-logged exercises (name + count), merged into the suggestions. */
    knownExercises?: KnownExercise[];
    id?: string;
    inputClassName?: string;
    labelClassName?: string;
    label?: string;
}

/**
 * Exercise input with a custom suggestion dropdown. Suggestions come from the shipped catalog merged
 * with the user's logged history (see exercise-suggestions.ts), token-matched and ranked so typing
 * "paused" surfaces every paused variant and "squat" the whole family. A "log as typed" row keeps
 * free-form entry one tap away — the user is never forced onto a catalog value.
 */
export default function ExerciseCombobox(props: ExerciseComboboxProps) {
    const {
        value,
        onChange,
        onCommit,
        knownExercises = [],
        id = "exercise",
        inputClassName,
        labelClassName,
        label = "Exercise",
    } = props;

    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const blurTimeout = useRef<ReturnType<typeof setTimeout>>();

    const suggestions = useMemo(
        () => searchExercises(value, knownExercises),
        [value, knownExercises],
    );

    // Offer the raw typed value as a custom option unless it already equals a listed suggestion.
    const normalizedTyped = normalizeExercise(value);
    const showCustomOption =
        normalizedTyped.length > 0 &&
        !suggestions.some((s) => s.name === normalizedTyped);

    // Flat list of selectable rows: suggestions, then the optional custom row.
    const rows: Array<{name: string; suggestion?: ExerciseSuggestion; custom?: boolean}> = [
        ...suggestions.map((suggestion) => ({name: suggestion.name, suggestion})),
        ...(showCustomOption ? [{name: normalizedTyped, custom: true}] : []),
    ];

    useEffect(() => () => clearTimeout(blurTimeout.current), []);

    const commit = (name: string) => {
        onChange(name);
        onCommit?.(name);
        setIsOpen(false);
        setActiveIndex(-1);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            setIsOpen(true);
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, rows.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            if (isOpen && activeIndex >= 0 && rows[activeIndex]) {
                e.preventDefault();
                commit(rows[activeIndex].name);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
            setActiveIndex(-1);
        }
    };

    const onBlur = () => {
        // Delay so a click on a suggestion registers before we close and normalize.
        blurTimeout.current = setTimeout(() => {
            setIsOpen(false);
            setActiveIndex(-1);
            const normalized = normalizeExercise(value);
            if (normalized !== value) onChange(normalized);
            onCommit?.(normalized);
        }, 120);
    };

    return (
        <div className="relative" ref={containerRef}>
            <input
                type="text"
                name={id}
                id={id}
                role="combobox"
                aria-expanded={isOpen}
                aria-controls={`${id}-listbox`}
                aria-autocomplete="list"
                aria-activedescendant={activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
                autoComplete="off"
                placeholder=" "
                className={inputClassName}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setIsOpen(true);
                    setActiveIndex(-1);
                }}
                onFocus={(e) => {
                    clearTimeout(blurTimeout.current);
                    e.target.select();
                    setIsOpen(true);
                }}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                required
            />
            <label className={labelClassName} htmlFor={id}>{label}</label>

            {isOpen && rows.length > 0 && (
                <ul
                    id={`${id}-listbox`}
                    role="listbox"
                    className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-base shadow-lg"
                >
                    {rows.map((row, index) => (
                        <li
                            key={`${row.custom ? "custom:" : ""}${row.name}`}
                            id={`${id}-option-${index}`}
                            role="option"
                            aria-selected={index === activeIndex}
                            // onMouseDown (not onClick) so it fires before the input's blur closes the list.
                            onMouseDown={(e) => {
                                e.preventDefault();
                                commit(row.name);
                            }}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 ${
                                index === activeIndex ? "bg-main/10" : ""
                            }`}
                        >
                            {row.custom ? (
                                <span className="text-gray-600">
                                    + Log <span className="font-medium text-gray-900">&ldquo;{row.name}&rdquo;</span> as new
                                </span>
                            ) : (
                                <>
                                    <span className="flex items-center gap-1.5 truncate">
                                        {row.suggestion?.isDefault && (
                                            <span className="text-amber-500" aria-hidden="true">★</span>
                                        )}
                                        <span className="truncate">{row.name}</span>
                                    </span>
                                    <span className="shrink-0 text-xs text-gray-400">
                                        {row.suggestion && row.suggestion.loggedCount > 0
                                            ? `logged ${row.suggestion.loggedCount}×`
                                            : row.suggestion?.isDefault
                                                ? "default"
                                                : ""}
                                    </span>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

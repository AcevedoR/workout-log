import {afterEach, describe, expect, it, vi} from "vitest";
import React, {useState} from "react";
import {cleanup, fireEvent, render, screen, within} from "@testing-library/react";
import ExerciseCombobox from "./exercise-combobox";

afterEach(() => cleanup());

// Controlled wrapper mirroring how LogForm drives the combobox, so typing updates `value`.
function Harness(props: {onCommit?: (v: string) => void; knownExercises?: {name: string; count: number}[]}) {
    const [value, setValue] = useState("");
    return (
        <ExerciseCombobox
            value={value}
            onChange={setValue}
            onCommit={props.onCommit}
            knownExercises={props.knownExercises}
        />
    );
}

const type = (text: string) => {
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, {target: {value: text}});
    return input;
};

describe("ExerciseCombobox", () => {
    it("token-matches across families as you type", () => {
        render(<Harness/>);
        type("paused");
        const options = screen.getAllByRole("option").map((o) => o.textContent);
        expect(options.join("|")).toContain("paused squat");
        expect(options.join("|")).toContain("paused bench press");
    });

    it("commits the canonical name when a suggestion is clicked", () => {
        const onCommit = vi.fn();
        render(<Harness onCommit={onCommit}/>);
        type("front sq");
        fireEvent.mouseDown(screen.getByText("front squat"));
        expect(onCommit).toHaveBeenCalledWith("front squat");
    });

    it("always offers a 'log as new' row for a custom name", () => {
        render(<Harness/>);
        type("zercher squat hold");
        expect(screen.getByText(/log as new/i)).toBeDefined();
    });

    it("marks a logged exercise with its count", () => {
        render(<Harness knownExercises={[{name: "hack squat", count: 9}]}/>);
        type("hack");
        const option = screen.getByText("hack squat").closest("li")!;
        expect(within(option).getByText(/logged 9×/)).toBeDefined();
    });

    it("selects the active option with keyboard (ArrowDown + Enter)", () => {
        const onCommit = vi.fn();
        render(<Harness onCommit={onCommit}/>);
        const input = type("squat");
        fireEvent.keyDown(input, {key: "ArrowDown"});
        fireEvent.keyDown(input, {key: "Enter"});
        expect(onCommit).toHaveBeenCalledTimes(1);
    });
});

import {describe, expect, it} from "vitest";
import {normalizeExercise} from "./exercise";

describe("normalizeExercise", () => {
    it("lowercases so casing variants collapse to one exercise", () => {
        expect(normalizeExercise("Benchpress")).toBe("benchpress");
        expect(normalizeExercise("BENCHPRESS")).toBe("benchpress");
        expect(normalizeExercise("benchpress")).toBe("benchpress");
    });

    it("trims surrounding whitespace", () => {
        expect(normalizeExercise("  deadlift ")).toBe("deadlift");
        expect(normalizeExercise("\tsquat\n")).toBe("squat");
    });

    it("collapses internal whitespace runs to a single space", () => {
        expect(normalizeExercise("bench  press")).toBe("bench press");
        expect(normalizeExercise("bench\tpress")).toBe("bench press");
    });

    it("maps every casing/spacing variant of the same name to an identical key", () => {
        const key = normalizeExercise("Bench Press");
        expect(normalizeExercise("bench press")).toBe(key);
        expect(normalizeExercise("  BENCH   press ")).toBe(key);
    });

    it("leaves an already-canonical name untouched", () => {
        expect(normalizeExercise("bench press")).toBe("bench press");
    });

    it("handles empty and whitespace-only input", () => {
        expect(normalizeExercise("")).toBe("");
        expect(normalizeExercise("   ")).toBe("");
    });
});

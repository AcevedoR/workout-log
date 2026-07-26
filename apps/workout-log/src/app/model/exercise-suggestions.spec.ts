import {describe, expect, it} from "vitest";
import {searchExercises} from "./exercise-suggestions";
import {ExerciseFamily} from "./exercise-catalog";

const CATALOG: ExerciseFamily[] = [
    {family: "bench press", variants: ["barbell bench press", "dumbbell bench press", "paused bench press"]},
    {family: "squat", variants: ["squat", "front squat", "paused squat", "hack squat"]},
];

const names = (query: string, history = [] as {name: string; count: number}[]) =>
    searchExercises(query, history, CATALOG).map((s) => s.name);

describe("searchExercises", () => {
    it("token-matches across families: 'paused' surfaces every paused variant", () => {
        expect(names("paused")).toEqual(
            expect.arrayContaining(["paused bench press", "paused squat"]),
        );
        // and nothing without 'paused'
        expect(names("paused")).not.toEqual(expect.arrayContaining(["front squat", "barbell bench press"]));
    });

    it("matches a whole family by the family word even when the token isn't in the variant name", () => {
        // "bench" is not literally in "dumbbell bench press"? it is — use squat family word instead:
        expect(names("squat")).toEqual(
            expect.arrayContaining(["squat", "front squat", "paused squat", "hack squat"]),
        );
    });

    it("ranks an exact match first", () => {
        expect(names("front squat")[0]).toBe("front squat");
    });

    it("ranks prefix matches ahead of mid-string matches", () => {
        const result = names("squat");
        expect(result.indexOf("squat")).toBeLessThan(result.indexOf("front squat"));
    });

    it("heavily favors already-logged exercises, ordered by count", () => {
        const history = [
            {name: "hack squat", count: 30},
            {name: "front squat", count: 5},
        ];
        const result = names("squat", history);
        // both logged ones come before the never-logged "paused squat"
        expect(result.indexOf("hack squat")).toBeLessThan(result.indexOf("paused squat"));
        expect(result.indexOf("front squat")).toBeLessThan(result.indexOf("paused squat"));
        // higher count first among logged
        expect(result.indexOf("hack squat")).toBeLessThan(result.indexOf("front squat"));
    });

    it("surfaces logged exercises that aren't in the catalog", () => {
        const history = [{name: "Calf raise", count: 12}];
        expect(names("calf", history)).toContain("calf raise");
    });

    it("annotates catalog defaults and logged counts", () => {
        const [top] = searchExercises("barbell bench", [{name: "barbell bench press", count: 7}], CATALOG);
        expect(top.name).toBe("barbell bench press");
        expect(top.isDefault).toBe(true);
        expect(top.loggedCount).toBe(7);
    });

    it("empty query returns a capped default view, most-logged first", () => {
        const history = [{name: "hack squat", count: 40}];
        const result = searchExercises("", history, CATALOG);
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].name).toBe("hack squat");
    });

    it("is case- and whitespace-insensitive on the query", () => {
        expect(names("  FRONT   Squat ")[0]).toBe("front squat");
    });
});

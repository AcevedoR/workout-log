/**
 * Read-only sanity check on the numeric fields (reps, weight) of the live `workout-log` data. The
 * migration never touches these, but this confirms the values themselves are logical: numeric,
 * positive, integer reps, quarter-kg weights, no wild outliers. Grouped by canonical exercise, with
 * a focused view on the big lifts and a global anomaly scan (with example doc ids).
 *
 * Writes nothing. Usage (from repo root):
 *   node_modules/.bin/ts-node --project data-migrations/tsconfig.json \
 *     data-migrations/src/report-numeric-sanity.ts [--project-id=<id>] [--user-id=<uid>]
 */
import {Firestore} from "firebase-admin/firestore";
import {DEFAULT_PROJECT_ID, initFirestore} from "./firestore";
import {resolveCanonicalExercise} from "./exercise-aliases";

const WORKOUT_LOG_COLLECTION = "workout-log";

interface Options {
    projectId: string;
    userId?: string;
}

function parseArgs(argv: string[]): Options {
    const opts: Options = {projectId: DEFAULT_PROJECT_ID};
    for (const arg of argv) {
        if (arg.startsWith("--project-id=")) opts.projectId = arg.slice("--project-id=".length);
        else if (arg.startsWith("--user-id=")) opts.userId = arg.slice("--user-id=".length);
        else throw new Error(`Unknown argument: ${arg}`);
    }
    return opts;
}

interface Row {
    id: string;
    exercise: string;
    reps: unknown;
    weight: unknown;
}

const isNum = (v: unknown): v is number => typeof v === "number" && !Number.isNaN(v);
const isQuarter = (v: number) => Number.isInteger(v * 4);

function stats(values: number[]) {
    if (values.length === 0) return {min: NaN, median: NaN, max: NaN, mean: NaN};
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return {min: sorted[0], median, max: sorted[sorted.length - 1], mean};
}

const fmt = (n: number) => (Number.isInteger(n) ? `${n}` : n.toFixed(1));

async function main() {
    const opts = parseArgs(process.argv.slice(2));
    const db: Firestore = initFirestore(opts.projectId);

    const base = db.collection(WORKOUT_LOG_COLLECTION);
    const snapshot = await (opts.userId ? base.where("userId", "==", opts.userId).get() : base.get());

    const rows: Row[] = [];
    snapshot.forEach((doc) => {
        rows.push({id: doc.id, exercise: doc.get("exercise"), reps: doc.get("reps"), weight: doc.get("weight")});
    });

    console.log("=".repeat(72));
    console.log(`Numeric sanity check (read-only)   project: ${opts.projectId}   docs: ${rows.length}`);
    console.log("=".repeat(72));

    // Global anomaly scan.
    const anomalies: Record<string, Row[]> = {
        "reps not a number": [],
        "reps <= 0": [],
        "reps not an integer": [],
        "reps > 50": [],
        "weight not a number": [],
        "weight <= 0": [],
        "weight not a 0.25 multiple": [],
        "weight > 400": [],
    };
    for (const r of rows) {
        if (!isNum(r.reps)) anomalies["reps not a number"].push(r);
        else {
            if (r.reps <= 0) anomalies["reps <= 0"].push(r);
            if (!Number.isInteger(r.reps)) anomalies["reps not an integer"].push(r);
            if (r.reps > 50) anomalies["reps > 50"].push(r);
        }
        if (!isNum(r.weight)) anomalies["weight not a number"].push(r);
        else {
            if (r.weight <= 0) anomalies["weight <= 0"].push(r);
            if (!isQuarter(r.weight)) anomalies["weight not a 0.25 multiple"].push(r);
            if (r.weight > 400) anomalies["weight > 400"].push(r);
        }
    }

    console.log(`\nAnomaly scan (whole collection):`);
    let anyAnomaly = false;
    for (const [label, list] of Object.entries(anomalies)) {
        if (list.length === 0) continue;
        anyAnomaly = true;
        const examples = list.slice(0, 5).map((r) => `"${r.exercise}" reps=${JSON.stringify(r.reps)} weight=${JSON.stringify(r.weight)} (${r.id})`);
        console.log(`   ${String(list.length).padStart(4)}×  ${label}`);
        for (const ex of examples) console.log(`          ${ex}`);
        if (list.length > 5) console.log(`          … and ${list.length - 5} more`);
    }
    if (!anyAnomaly) console.log("   ✓ none — all reps are positive integers, all weights positive 0.25 multiples ≤ 400");

    // Break the non-positive weights down by exercise — negative weight is often a deliberate
    // "assisted / counterweight" convention (e.g. assisted dips, pull-ups), not corrupt data.
    const nonPositive = anomalies["weight <= 0"];
    if (nonPositive.length > 0) {
        const byExercise = new Map<string, {count: number; min: number; max: number}>();
        for (const r of nonPositive) {
            const name = typeof r.exercise === "string" ? r.exercise : String(r.exercise);
            const w = r.weight as number;
            const agg = byExercise.get(name) ?? {count: 0, min: w, max: w};
            agg.count++;
            agg.min = Math.min(agg.min, w);
            agg.max = Math.max(agg.max, w);
            byExercise.set(name, agg);
        }
        console.log(`\n   weight ≤ 0 breakdown by exercise (likely assisted/bodyweight):`);
        for (const [name, agg] of Array.from(byExercise.entries()).sort((a, b) => b[1].count - a[1].count)) {
            console.log(`      ${String(agg.count).padStart(4)}×  "${name}"   weight range ${agg.min}..${agg.max}`);
        }
    }

    // Per-focus-exercise reps/weight ranges.
    const focus = ["barbell bench press", "dumbbell bench press", "squat", "deadlift"];
    const byTarget = new Map<string, {reps: number[]; weights: number[]}>();
    for (const r of rows) {
        if (typeof r.exercise !== "string") continue;
        const key = resolveCanonicalExercise(r.exercise);
        const bucket = byTarget.get(key) ?? {reps: [], weights: []};
        if (isNum(r.reps)) bucket.reps.push(r.reps);
        if (isNum(r.weight)) bucket.weights.push(r.weight);
        byTarget.set(key, bucket);
    }

    console.log(`\nFocus exercises — reps & weight ranges (min · median · max, mean):`);
    for (const name of focus) {
        const bucket = byTarget.get(name);
        if (!bucket) {
            console.log(`\n  ${name}: (none)`);
            continue;
        }
        const rs = stats(bucket.reps);
        const ws = stats(bucket.weights);
        console.log(`\n  ${name}  (${bucket.reps.length} sets)`);
        console.log(`     reps:   ${fmt(rs.min)} · ${fmt(rs.median)} · ${fmt(rs.max)}   (mean ${fmt(rs.mean)})`);
        console.log(`     weight: ${fmt(ws.min)} · ${fmt(ws.median)} · ${fmt(ws.max)}   (mean ${fmt(ws.mean)})`);
    }
}

main().catch((e) => {
    console.error("Sanity check failed:", e);
    process.exit(1);
});

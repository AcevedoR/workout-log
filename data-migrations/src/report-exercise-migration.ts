/**
 * Read-only verification for the exercise-name migration. Groups the live `workout-log` data by the
 * canonical name each doc WOULD get, lists the source names feeding each target, and checks that no
 * document is lost or double-counted (sum of sources === sum of targets === total docs).
 *
 * Writes nothing. Usage (from repo root):
 *   node_modules/.bin/ts-node --project data-migrations/tsconfig.json \
 *     data-migrations/src/report-exercise-migration.ts [--project-id=<id>] [--user-id=<uid>]
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

async function main() {
    const opts = parseArgs(process.argv.slice(2));
    const db: Firestore = initFirestore(opts.projectId);

    const base = db.collection(WORKOUT_LOG_COLLECTION);
    const snapshot = await (opts.userId ? base.where("userId", "==", opts.userId).get() : base.get());

    // Count raw stored names, and where each maps to.
    const sourceCounts = new Map<string, number>();
    let totalDocs = 0;
    let nonStringExercise = 0;
    snapshot.forEach((doc) => {
        const exercise = doc.get("exercise");
        if (typeof exercise !== "string") {
            nonStringExercise++;
            return;
        }
        totalDocs++;
        sourceCounts.set(exercise, (sourceCounts.get(exercise) ?? 0) + 1);
    });

    // Aggregate by canonical target.
    interface Target {
        total: number;
        sources: Array<{name: string; count: number}>;
    }
    const targets = new Map<string, Target>();
    for (const [name, count] of sourceCounts.entries()) {
        const canonical = resolveCanonicalExercise(name);
        const target = targets.get(canonical) ?? {total: 0, sources: []};
        target.total += count;
        target.sources.push({name, count});
        targets.set(canonical, target);
    }

    console.log("=".repeat(72));
    console.log(`Exercise migration verification (read-only)   project: ${opts.projectId}`);
    console.log("=".repeat(72));

    // Coherence checks.
    const sumTargets = Array.from(targets.values()).reduce((acc, t) => acc + t.total, 0);
    const distinctBefore = sourceCounts.size;
    const distinctAfter = targets.size;
    console.log(`\nTotal workout-log docs:        ${totalDocs}`);
    console.log(`Sum of canonical target counts: ${sumTargets}   ${sumTargets === totalDocs ? "✓ conserved" : "✗ MISMATCH"}`);
    console.log(`Distinct exercise names:        ${distinctBefore} before  →  ${distinctAfter} after  (${distinctBefore - distinctAfter} merged away)`);
    if (nonStringExercise > 0) console.log(`⚠ docs with non-string exercise (skipped): ${nonStringExercise}`);

    // Focus families the user asked to sanity-check.
    const focus = ["barbell bench press", "dumbbell bench press", "squat", "deadlift", "paused squat", "leg press"];
    console.log(`\nFocus exercises (target  ⟵  sources):`);
    for (const name of focus) {
        const t = targets.get(name);
        if (!t) {
            console.log(`\n  ${name}: (none)`);
            continue;
        }
        console.log(`\n  ${name}  = ${t.total}`);
        for (const s of t.sources.sort((a, b) => b.count - a.count)) {
            const tag = resolveCanonicalExercise(s.name) === s.name && s.name === name ? " (already canonical)" : "";
            console.log(`     ${String(s.count).padStart(4)}×  "${s.name}"${tag}`);
        }
    }

    // Show every target that consolidates more than one source, so merges are auditable at a glance.
    console.log(`\nAll merges (targets fed by >1 source):`);
    const merges = Array.from(targets.entries())
        .filter(([, t]) => t.sources.length > 1)
        .sort((a, b) => b[1].total - a[1].total);
    if (merges.length === 0) console.log("   (none)");
    for (const [name, t] of merges) {
        const parts = t.sources.sort((a, b) => b.count - a.count).map((s) => `"${s.name}"×${s.count}`);
        console.log(`   ${name}  = ${t.total}   ⟵  ${parts.join("  +  ")}`);
    }
}

main().catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
});

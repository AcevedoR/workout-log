/**
 * One-time migration: canonicalize existing exercise names in Firestore so historical data lines up
 * with the app's new case-insensitive matching.
 *
 *   - `workout-log`         : rewrites each doc's `exercise` field to its canonical form.
 *   - `exercise-statistics` : deletes docs whose id/exercise is no longer canonical (doc id is
 *                             `${userId}-${exercise}`). The cloud function recomputes them on its
 *                             next run, so the "usual lift" widget self-heals.
 *
 * DRY RUN BY DEFAULT — prints the full plan and writes nothing. Pass --commit to apply.
 *
 * Usage (from repo root):
 *   node_modules/.bin/ts-node --project data-migrations/tsconfig.json \
 *     data-migrations/src/normalize-exercise-names.ts [--commit] [--project-id=<id>] [--user-id=<uid>]
 */
import {Firestore} from "firebase-admin/firestore";
import {DEFAULT_PROJECT_ID, initFirestore} from "./firestore";
import {resolveCanonicalExercise} from "./exercise-aliases";

const WORKOUT_LOG_COLLECTION = "workout-log";
const EXERCISE_STATISTICS_COLLECTION = "exercise-statistics";
const BATCH_LIMIT = 400; // Firestore caps a batch at 500 writes; stay comfortably under.

interface Options {
    commit: boolean;
    projectId: string;
    userId?: string;
}

function parseArgs(argv: string[]): Options {
    const opts: Options = {commit: false, projectId: DEFAULT_PROJECT_ID};
    for (const arg of argv) {
        if (arg === "--commit") opts.commit = true;
        else if (arg.startsWith("--project-id=")) opts.projectId = arg.slice("--project-id=".length);
        else if (arg.startsWith("--user-id=")) opts.userId = arg.slice("--user-id=".length);
        else throw new Error(`Unknown argument: ${arg}`);
    }
    return opts;
}

interface WorkoutRename {
    id: string;
    from: string;
    to: string;
}

async function planWorkoutLog(db: Firestore, userId?: string): Promise<WorkoutRename[]> {
    const base = db.collection(WORKOUT_LOG_COLLECTION);
    const snapshot = await (userId ? base.where("userId", "==", userId).get() : base.get());

    const renames: WorkoutRename[] = [];
    snapshot.forEach((doc) => {
        const exercise = doc.get("exercise");
        if (typeof exercise !== "string") return;
        const canonical = resolveCanonicalExercise(exercise);
        if (canonical !== exercise) {
            renames.push({id: doc.id, from: exercise, to: canonical});
        }
    });
    return renames;
}

interface StaleStat {
    id: string;
    exercise: string;
    reason: string;
}

async function planExerciseStatistics(db: Firestore, userId?: string): Promise<StaleStat[]> {
    const base = db.collection(EXERCISE_STATISTICS_COLLECTION);
    const snapshot = await (userId ? base.where("userId", "==", userId).get() : base.get());

    const stale: StaleStat[] = [];
    snapshot.forEach((doc) => {
        const exercise = doc.get("exercise");
        const docUserId = doc.get("userId");
        if (typeof exercise !== "string") return;
        const canonical = resolveCanonicalExercise(exercise);
        const expectedId = `${docUserId}-${canonical}`;
        if (canonical !== exercise) {
            stale.push({id: doc.id, exercise, reason: `non-canonical name -> "${canonical}"`});
        } else if (doc.id !== expectedId) {
            stale.push({id: doc.id, exercise, reason: `id mismatch, expected "${expectedId}"`});
        }
    });
    return stale;
}

function summarizeRenames(renames: WorkoutRename[]): void {
    const byPair = new Map<string, number>();
    for (const r of renames) {
        const key = `${r.from}  ⟶  ${r.to}`;
        byPair.set(key, (byPair.get(key) ?? 0) + 1);
    }
    const pairs = [...byPair.entries()].sort((a, b) => b[1] - a[1]);
    for (const [pair, count] of pairs) {
        console.log(`   ${String(count).padStart(4)}×  ${pair}`);
    }
}

async function applyWorkoutRenames(db: Firestore, renames: WorkoutRename[]): Promise<void> {
    for (let i = 0; i < renames.length; i += BATCH_LIMIT) {
        const batch = db.batch();
        for (const r of renames.slice(i, i + BATCH_LIMIT)) {
            batch.update(db.collection(WORKOUT_LOG_COLLECTION).doc(r.id), {exercise: r.to});
        }
        await batch.commit();
    }
}

async function applyStatDeletions(db: Firestore, stale: StaleStat[]): Promise<void> {
    for (let i = 0; i < stale.length; i += BATCH_LIMIT) {
        const batch = db.batch();
        for (const s of stale.slice(i, i + BATCH_LIMIT)) {
            batch.delete(db.collection(EXERCISE_STATISTICS_COLLECTION).doc(s.id));
        }
        await batch.commit();
    }
}

async function main() {
    const opts = parseArgs(process.argv.slice(2));

    console.log("=".repeat(72));
    console.log(`Exercise-name normalization migration  [${opts.commit ? "COMMIT" : "DRY RUN"}]`);
    console.log(`Project: ${opts.projectId}${opts.userId ? `   user filter: ${opts.userId}` : ""}`);
    console.log("=".repeat(72));

    const db = initFirestore(opts.projectId);

    const renames = await planWorkoutLog(db, opts.userId);
    console.log(`\nworkout-log: ${renames.length} document(s) need renaming`);
    if (renames.length > 0) summarizeRenames(renames);

    const stale = await planExerciseStatistics(db, opts.userId);
    console.log(`\nexercise-statistics: ${stale.length} stale doc(s) to delete (recomputed by the cloud function)`);
    for (const s of stale) console.log(`   ${s.id}  (${s.reason})`);

    if (!opts.commit) {
        console.log("\nDRY RUN — no changes written. Re-run with --commit to apply.");
        return;
    }

    console.log("\nApplying changes...");
    await applyWorkoutRenames(db, renames);
    await applyStatDeletions(db, stale);
    console.log(`Done: renamed ${renames.length} workout-log doc(s), deleted ${stale.length} exercise-statistics doc(s).`);
}

main().catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
});

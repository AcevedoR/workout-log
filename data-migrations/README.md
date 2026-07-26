# data-migrations

One-off, kept-for-reference scripts that mutate the workout-log Firestore database. They are
deliberately isolated from the apps so this folder can be lifted into its own repo later.

**Safety contract:** every script is **dry-run by default** and writes nothing until passed
`--commit`.

## Prerequisites

Authenticate once with an account that has Firestore access to the target project:

```bash
gcloud auth application-default login
```

The scripts connect via Application Default Credentials to project `workout-log-424900` (override
with `--project-id=<id>`).

## Migrations

### `normalize-exercise-names.ts`

Canonicalizes historical exercise names so old data lines up with the app's case-insensitive
matching (see `apps/workout-log/src/app/model/exercise.ts`). It reuses that same
`normalizeExercise()` function, then applies explicit renames from `src/exercise-aliases.ts`
(currently `"Barrel benchp press" → "bench press"`).

- Rewrites each `workout-log` doc's `exercise` field to its canonical form.
- Deletes stale `exercise-statistics` docs (id is `${userId}-${exercise}`); the cloud function
  recomputes them on its next run, so the "usual lift" widget self-heals.

Run from the repo root:

```bash
# Dry run — prints the full plan, writes nothing
node_modules/.bin/ts-node --project data-migrations/tsconfig.json \
  data-migrations/src/normalize-exercise-names.ts

# Apply
node_modules/.bin/ts-node --project data-migrations/tsconfig.json \
  data-migrations/src/normalize-exercise-names.ts --commit
```

Flags: `--commit`, `--project-id=<id>`, `--user-id=<uid>` (restrict to a single user).

To add another one-off rename, edit the `EXERCISE_RENAMES` map in `src/exercise-aliases.ts`.

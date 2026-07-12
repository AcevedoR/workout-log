# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A minimalistic strength-training workout logger. You log `(exercise, reps, weight, date)` entries; the app shows recent history, personal bests, per-exercise progression charts, and a computed "usual lift" for each exercise. Live preview: https://workout-log-weld.vercel.app/

## Commands

Nx monorepo — targets run via `npx nx <target> <project>`.

```bash
npm i                                      # install
npx nx emulators workout-log               # start Firebase emulators (auth:9099, firestore:9098, functions:5001, UI on), seeded from firebase-emulators-data
npx nx dev workout-log                     # run Next.js frontend (needs emulators running for auth/db in dev)

npx nx test workout-log                    # vitest unit tests (jsdom); *.spec.ts(x) co-located with source
npx nx test exercise-statistics            # vitest unit tests for the cloud function domain
npx vitest run path/to/file.spec.ts        # single test file (run from the app dir, or use --root)
npx nx lint workout-log                    # eslint

npx nx e2e workout-log                     # Playwright e2e — runs inside `firebase emulators:exec` with seed data
npx nx e2e-ui workout-log                  # same, Playwright UI mode

npx nx build exercise-statistics           # tsc compile the function
npx nx deploy exercise-statistics          # firebase deploy --only functions (gated on e2e in CI)
```

Frontend deploys to **Vercel** (not via nx). The `exercise-statistics` function deploys to **Firebase**. CI (`.github/workflows/`) runs `nx affected -t test build`, installs Playwright + firebase-tools, runs `e2e`, and on `main` also `deploy`.

## Architecture

Two Nx apps that communicate only through Firestore — there is no direct API between them.

### `apps/workout-log` — Next.js 14 App Router frontend
- Client-heavy: nearly every component is `'use client'`. `page.tsx` → `AuthContextProvider` → `ConnexionWallPage` gates on Google auth, then renders `home.tsx` (the main screen).
- `firebase.ts` initializes the Firebase app and, **when `NODE_ENV !== 'production'`, connects to local emulators** (see `FeaturesConfiguration.isDevModeEnabled`). Firebase web config is committed (public by design for a client SDK).
- Auth: `auth/auth-context.tsx` wraps Firebase Google popup sign-in and exposes `UserAuth()` hook.
- Firestore access is isolated in `firestore/`:
  - `WorkoutFirestore.ts` — CRUD on the raw `workout-log` collection (`add`, `deleteOne`, `getMostRecents`, `findPersonalBest`). All queries filter `where("userId", "==", userId)`.
  - `WorkoutStatisticsFirestore.ts` — reads the `exercise-statistics` collection (usual lifts) computed by the function.
- Path alias `@/*` → `src/*`.

### `apps/exercise-statistics` — Firebase Cloud Function (gen2 `onRequest`)
- Plain `tsc` build, ESM (`"type": "module"`, so relative imports use `.js` extensions even for `.ts` sources).
- `index.ts`: `calculate` iterates users (cap `MAX_HANDLED_USER_COUNT = 20`), skips users not active in the last 24h (`domain/UserActivity.ts`), and for each exercise recomputes a "usual lift" and upserts it into `exercise-statistics`.
- **Reaches directly into the frontend app's source** for shared types: it imports `../../workout-log/src/app/UserID.js` and `workout.js`. Keep those types compatible when editing either side.
- Core business logic is `domain/CalculateUsualLift.ts` — a median-style pick over recent workouts (filters `reps >= 3`, needs ≥3 workouts, resolves ties into a weight average or a `UsualLiftRange`). This is the most logic-dense file; it has unit tests (`.spec.ts`).

### Firestore data model
- `workout-log` collection: `{ exercise, reps, weight, date (epoch ms), userId }`.
- `exercise-statistics` collection: doc id is **`${userId}-${exercise}`**, value `{ exercise, usualLift: { reps, weight }, userId, _updatedDate }`. The `${userId}-${exercise}` id convention is duplicated in both apps (marked with TODOs) — change both together.

## Conventions & gotchas
- Firestore functions swallow errors with `try/catch → console.error` and return empty/undefined rather than throwing. Callers assume best-effort reads.
- e2e tests depend on the seed data in `firebase-emulators-data/` — if you change the data model, the seed and specs in `apps/workout-log/e2e/` may need updating.
- Reps of `weight` accept `.25` decimal increments (recent feature); don't assume integer weights.

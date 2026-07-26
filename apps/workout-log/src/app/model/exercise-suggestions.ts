import {normalizeExercise} from "./exercise";
import {EXERCISE_CATALOG, ExerciseFamily} from "./exercise-catalog";

/** An exercise the user has already logged, with how many times (drives the "log this a lot" boost). */
export interface KnownExercise {
    name: string;
    count: number;
}

export interface ExerciseSuggestion {
    /** Canonical name to store when picked. */
    name: string;
    /** Family label, when the suggestion comes from the catalog. */
    family?: string;
    /** True when this is its family's default variant (variants[0]). */
    isDefault: boolean;
    /** How many times the user has logged it (0 = catalog-only, never logged). */
    loggedCount: number;
}

interface Candidate extends ExerciseSuggestion {
    /** Extra searchable text (name + family) so "bench" matches every bench-press variant. */
    searchText: string;
    /** Position within the catalog, used as a stable tiebreak so defaults/earlier variants win. */
    order: number;
}

export const MAX_SUGGESTIONS = 8;

function buildCandidates(history: KnownExercise[], catalog: ExerciseFamily[]): Candidate[] {
    const byName = new Map<string, Candidate>();

    let order = 0;
    for (const {family, variants} of catalog) {
        variants.forEach((variant, index) => {
            const name = normalizeExercise(variant);
            byName.set(name, {
                name,
                family,
                isDefault: index === 0,
                loggedCount: 0,
                searchText: `${name} ${family}`,
                order: order++,
            });
        });
    }

    // Merge in the user's history: annotate matching catalog entries with their count, and add any
    // logged exercise that isn't in the catalog so custom names still get suggested next time.
    for (const {name: rawName, count} of history) {
        const name = normalizeExercise(rawName);
        if (!name) continue;
        const existing = byName.get(name);
        if (existing) {
            existing.loggedCount = count;
        } else {
            byName.set(name, {
                name,
                isDefault: false,
                loggedCount: count,
                searchText: name,
                order: order++,
            });
        }
    }

    return Array.from(byName.values());
}

function matches(candidate: Candidate, tokens: string[]): boolean {
    return tokens.every((token) => candidate.searchText.includes(token));
}

/**
 * Ranks candidates for a query. Priority: exact match, then prefix match, then already-logged
 * (heavily — by count), then family defaults, then catalog order, then shorter names. The result is
 * a flat list the combobox renders with "(default)" / "logged N×" annotations.
 */
function compare(a: Candidate, b: Candidate, normalizedQuery: string): number {
    if (normalizedQuery) {
        const aExact = a.name === normalizedQuery;
        const bExact = b.name === normalizedQuery;
        if (aExact !== bExact) return aExact ? -1 : 1;

        const aPrefix = a.name.startsWith(normalizedQuery);
        const bPrefix = b.name.startsWith(normalizedQuery);
        if (aPrefix !== bPrefix) return aPrefix ? -1 : 1;
    }

    const aLogged = a.loggedCount > 0;
    const bLogged = b.loggedCount > 0;
    if (aLogged !== bLogged) return aLogged ? -1 : 1;
    if (a.loggedCount !== b.loggedCount) return b.loggedCount - a.loggedCount;

    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
    if (a.order !== b.order) return a.order - b.order;
    return a.name.length - b.name.length;
}

/**
 * Returns up to MAX_SUGGESTIONS ranked exercise suggestions for what the user has typed. An empty
 * query yields the "default" view (most-logged first, then family defaults). The combobox is
 * responsible for offering the raw typed value as a custom "log as new" option on top of these.
 */
export function searchExercises(
    rawQuery: string,
    history: KnownExercise[] = [],
    catalog: ExerciseFamily[] = EXERCISE_CATALOG,
): ExerciseSuggestion[] {
    const normalizedQuery = normalizeExercise(rawQuery);
    const tokens = normalizedQuery.split(" ").filter(Boolean);

    const candidates = buildCandidates(history, catalog)
        .filter((candidate) => matches(candidate, tokens))
        .sort((a, b) => compare(a, b, normalizedQuery));

    return candidates.slice(0, MAX_SUGGESTIONS).map(({searchText, order, ...suggestion}) => suggestion);
}

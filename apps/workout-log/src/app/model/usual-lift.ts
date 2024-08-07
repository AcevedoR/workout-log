export interface UsualLift {
    exercise: string,
    reps: number | UsualLiftRange,
    weight: number
}

export class UsualLiftRange {
    begin: number;
    end: number;

    constructor(begin: number, end: number) {
        if (begin >= end) {
            throw new Error(`UsualLift Range must have begin < end, begin: ${begin}, end: ${end}`);
        }

        this.begin = begin;
        this.end = end;
    }
}
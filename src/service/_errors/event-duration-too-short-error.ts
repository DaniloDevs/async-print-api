import { AppError } from "./app-error";

export class EventDurationTooShortError extends AppError {
    constructor(minMinutes: number, actualMinutes: number) {
        super(
            `Event duration ${actualMinutes}m is shorter than minimum allowed ${minMinutes}m`,
            400,
        );
        this.name = "EventDurationTooShortError";
    }
}

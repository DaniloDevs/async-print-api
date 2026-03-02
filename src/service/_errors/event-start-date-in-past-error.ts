import { AppError } from "./app-error";

export class EventStartDateInPastError extends AppError {
    constructor(startAt: Date) {
        super(
            `Event start date ${startAt.toISOString()} cannot be in the past`,
            400,
        );
        this.name = "EventStartDateInPastError";
    }
}

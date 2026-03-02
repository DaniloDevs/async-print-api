import { AppError } from "./app-error";

export class EventEndBeforeStartError extends AppError {
    constructor(startAt: Date, endsAt: Date) {
        super(
            `Event end date ${endsAt.toISOString()} cannot be before start date ${startAt.toISOString()}`,
            400,
        );
        this.name = "EventEndBeforeStartError";
    }
}

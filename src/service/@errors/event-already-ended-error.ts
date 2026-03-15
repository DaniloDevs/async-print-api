import { AppError } from "./app-error";

export class EventAlreadyEndedError extends AppError {
    constructor(public readonly endAt: Date) {
        super("Event already ended", 400);
    }
}

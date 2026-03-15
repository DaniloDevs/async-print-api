import { AppError } from "./app-error";

export class EventAlreadyExistsError extends AppError {
    constructor(slug: string) {
        super(`Event with slug "${slug}" already exists`, 409);
        this.name = "EventAlreadyExistsError";
    }
}

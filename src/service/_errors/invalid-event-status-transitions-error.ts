import type { EventStatus } from "./../../repository/event";

import { AppError } from "./app-error";

export class InvalidEventStatusTransitionError extends AppError {
    constructor(from: EventStatus, to: EventStatus) {
        super(`Cannot change status from ${from} to ${to}`, 400);
        this.name = "InvalidEventStatusTransitionError";
    }
}

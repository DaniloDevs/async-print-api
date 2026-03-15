import { AppError } from "./app-error";

export class EventNotActiveError extends AppError {
    constructor(eventSlug: string) {
        super(`O evento "${eventSlug}" não está ativo no momento`, 400);
        this.name = "EventNotActiveError";
    }
}

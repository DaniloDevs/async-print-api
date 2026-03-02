import { AppError } from "./app-error";

export class EventNotStartedYetError extends AppError {
    constructor(startAt: Date) {
        const startDate = new Date(startAt).toLocaleString("pt-BR");
        super(`O evento ainda não começou. Data de início: ${startDate}`, 400);
        this.name = "EventNotStartedYetError";
    }
}

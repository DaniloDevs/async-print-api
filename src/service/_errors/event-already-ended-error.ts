export class EventAlreadyEndedError extends Error {
    constructor(endAt: Date) {
        const endDate = new Date(endAt).toLocaleString("pt-BR");
        super(`O evento já terminou. Data de término: ${endDate}`);
        this.name = "EventAlreadyEndedError";
    }
}

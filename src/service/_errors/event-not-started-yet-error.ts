export class EventNotStartedYetError extends Error {
    constructor(startAt: Date) {
        const startDate = new Date(startAt).toLocaleString("pt-BR");
        super(`O evento ainda não começou. Data de início: ${startDate}`);
        this.name = "EventNotStartedYetError";
    }
}

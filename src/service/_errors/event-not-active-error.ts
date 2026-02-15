export class EventNotActiveError extends Error {
    constructor(eventSlug: string) {
        super(`O evento "${eventSlug}" não está ativo no momento`);
        this.name = "EventNotActiveError";
    }
}

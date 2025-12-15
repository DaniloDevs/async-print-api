export class EventAlreadyExistsError extends Error {
    constructor(slug: string) {
        super(`Event with slug "${slug}" already exists`);
        this.name = "EventAlreadyExistsError";
    }
}

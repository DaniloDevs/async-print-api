export class LeadAlreadyRegisteredError extends Error {
    constructor(email: string, eventSlug: string) {
        super(`O email "${email}" já está registrado no evento "${eventSlug}"`);
        this.name = "LeadAlreadyRegisteredError";
    }
}

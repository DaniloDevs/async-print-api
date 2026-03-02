import { AppError } from "./app-error";

export class LeadAlreadyRegisteredError extends AppError {
    constructor(email: string, eventSlug: string) {
        super(
            `O email "${email}" já está registrado no evento "${eventSlug}"`,
            409,
        );
        this.name = "LeadAlreadyRegisteredError";
    }
}

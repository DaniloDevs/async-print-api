import { AppError } from "./app-error";

export class LeadsNotFoundError extends AppError {
    constructor({ resource }: { resource: string }) {
        super(
            `Nenhum lead encontrado para o identificador "${resource}".`,
            404,
        );
        this.name = "LeadsNotFoundError";
    }
}

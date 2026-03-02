import { AppError } from "./app-error";

export class PrinterAlreadyExistsError extends AppError {
    constructor(slug: string) {
        super(`Printer with slug "${slug}" already exists`, 409);
        this.name = "PrinterAlreadyExistsError";
    }
}

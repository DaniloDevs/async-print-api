export class PrinterAlreadyExistsError extends Error {
    constructor(slug: string) {
        super(`Printer with slug "${slug}" already exists`);
        this.name = "PrinterAlreadyExistsError";
    }
}

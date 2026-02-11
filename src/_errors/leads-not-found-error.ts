export class LeadsNotFoundError extends Error {
    constructor({
        resource,
    }: { resource: string; }) {
        super(`Nenhum lead encontrado para o identificador "${resource}".`);
        this.name = "LeadsNotFoundError";
    }
}

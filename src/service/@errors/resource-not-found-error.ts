import { AppError } from "./app-error";

export class ResourceNotFoundError extends AppError {
    constructor({
        resource,
        resourceType,
    }: { resource: string; resourceType: string }) {
        super(
            `${resourceType} with identifier "${resource}" was not found`,
            404,
        );
        this.name = "ResourceNotFoundError";
    }
}

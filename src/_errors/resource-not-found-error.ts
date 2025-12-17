export class ResourceNotFoundError extends Error {
    constructor({
        resource,
        resourceType,
    }: { resource: string; resourceType: string }) {
        super(`${resourceType} with identifier "${resource}" was not found`);
        this.name = "ResourceNotFoundError";
    }
}

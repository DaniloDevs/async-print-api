export class InvalidFileTypeError extends Error {
    constructor({
        mimetype,
        allowedTypes,
    }: { mimetype: string; allowedTypes: string[] }) {
        super(
            `File type "${mimetype}" is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
        );
        this.name = "InvalidFileTypeError";
    }
}

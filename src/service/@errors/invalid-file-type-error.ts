import { AppError } from "./app-error";

export class InvalidFileTypeError extends AppError {
    constructor({
        mimetype,
        allowedTypes,
    }: { mimetype: string; allowedTypes: string[] }) {
        super(
            `File type "${mimetype}" is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
            400,
        );
        this.name = "InvalidFileTypeError";
    }
}

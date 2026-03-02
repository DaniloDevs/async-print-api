import { AppError } from "./app-error";

export class InvalidCredentilsError extends AppError {
    constructor() {
        super("Invalid credentials", 401);
        this.name = "InvalidCredentilsError";
    }
}

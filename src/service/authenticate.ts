import { compare } from "bcryptjs";
import type { IUserRepository } from "../repository/user";
import { InvalidCredentilsError } from "./_errors/invalid-credentials";

interface AuthenticateRequest {
    email: string;
    password: string;
}

export class AuthenticateService {
    constructor(private repository: IUserRepository) {}

    async execute({ email, password }: AuthenticateRequest) {
        const user = await this.repository.findByEmail(email);

        if (!user) {
            throw new InvalidCredentilsError();
        }

        const doesPasswordMatchs = await compare(password, user.passwordHash);

        if (!doesPasswordMatchs) {
            throw new InvalidCredentilsError();
        }

        return { user };
    }
}

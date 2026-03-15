import { prisma } from "../../../lib/prisma";
import { UserPrismaRepository } from "../../../repository/prisma/user";
import { AuthenticateWithPasswordService } from "../../auth/authenticate-with-password";

export function makeAuthenticateWithPassword() {
    const userRepository = new UserPrismaRepository(prisma);
    const service = new AuthenticateWithPasswordService(userRepository);

    return service;
}

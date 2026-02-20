import { prisma } from "../../../lib/prisma";
import { UserPrismaRepository } from "../../../repository/prisma/user";
import { CreateUserService } from "../../auth/create-user";

export function MakeCreateUser() {
    const userRepository = new UserPrismaRepository(prisma);
    const createUserService = new CreateUserService(userRepository);

    return createUserService;
}

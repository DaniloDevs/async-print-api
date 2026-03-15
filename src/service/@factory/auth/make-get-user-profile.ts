import { prisma } from "../../../lib/prisma";
import { UserPrismaRepository } from "../../../repository/prisma/user";
import { GetUserProfileService } from "../../auth/get-user-profile";

export function MakeGetUserProfileService() {
    const userRepository = new UserPrismaRepository(prisma);
    const getUserProfileService = new GetUserProfileService(userRepository);

    return getUserProfileService;
}

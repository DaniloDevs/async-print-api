import type { IUserRepository, User } from "../../repository/user";
import { ResourceNotFoundError } from "../@errors/resource-not-found-error";

interface GetUserProfileServiceDTO {
    userId: string;
}

interface GetUserProfileServiceResponse {
    user: User;
}

export class GetUserProfileService {
    constructor(private userRepository: IUserRepository) {}

    async execute({
        userId,
    }: GetUserProfileServiceDTO): Promise<GetUserProfileServiceResponse> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new ResourceNotFoundError({
                resource: "User",
                resourceType: userId,
            });
        }

        user.passwordHash = "";

        return { user };
    }
}

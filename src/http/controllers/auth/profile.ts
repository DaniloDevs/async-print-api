import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { userSchema } from "../../../repository/user";
import { MakeGetUserProfileService } from "../../../service/_factory/auth/make-get-user-profile";

export async function profileController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const getUserProfile = MakeGetUserProfileService();

    const user = await getUserProfile.execute({
        userId: request.user.sub,
    });

    return reply.status(200).send({
        user,
    });
}

export const ProfileControllerSchema: FastifySchema = {
    summary: "Get authenticated user's profile",
    tags: ["Auth"],
    response: {
        200: userSchema,
    },
};

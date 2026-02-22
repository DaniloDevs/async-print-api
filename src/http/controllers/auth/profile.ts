import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import { userSchema } from "../../../repository/user";
import { MakeGetUserProfileService } from "../../../service/_factory/auth/make-get-user-profile";

export async function profileController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const getUserProfile = MakeGetUserProfileService();

    const { user } = await getUserProfile.execute({
        userId: request.user.sub,
    });

    return reply.status(200).send({
        user,
    });
}

export const ProfileControllerSchema: FastifySchema = {
    summary: "Get user profile",
    description:
        "This endpoint allows an authenticated user to retrieve their profile information.",
    tags: ["Auth"],
    response: {
        200: z
            .object({
                user: userSchema,
            })
            .describe("Authenticated user's profile"),
    },
};

import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";

export default async function refreshController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    await request.jwtVerify({ onlyCookie: true });

    const token = await reply.jwtSign(
        {},
        {
            sign: {
                sub: request.user.sub,
            },
        },
    );

    const refreshToken = await reply.jwtSign(
        {},
        {
            sign: {
                sub: request.user.sub,
                expiresIn: "7d",
            },
        },
    );

    return reply
        .setCookie("refreshToken", refreshToken, {
            path: "/",
            secure: true,
            httpOnly: true,
            sameSite: true,
        })
        .status(200)
        .send({ token });
}

export const RefreshControllerSchema: FastifySchema = {
    summary: "Generate a new access token ",
    description: "This endpoint allows an authenticated user to generate a new access token using a valid refresh token stored in cookies.",
    tags: ["Auth"],
    response: {
        200: z.object({
            token: z.string(),
        }).describe("Successful token refresh"),
    },
};

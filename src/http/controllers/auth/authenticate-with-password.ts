import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import { InvalidCredentilsError } from "../../../service/_errors/invalid-credentials";
import { makeAuthenticateWithPassword } from "../../../service/_factory/auth/make-autheticate-with-password";

export default async function AuthenticateWithPasswordController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const requestBodySchema = z.object({
        email: z.email(),
        password: z.string(),
    });

    const { email, password } = requestBodySchema.parse(request.body);

    try {
        const authenticateService = makeAuthenticateWithPassword();

        const { user } = await authenticateService.execute({
            email,
            password,
        });

        const token = await reply.jwtSign(
            {},
            {
                sign: {
                    sub: user.id,
                },
            },
        );

        const refreshToken = await reply.jwtSign(
            {},
            {
                sign: {
                    sub: user.id,
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
    } catch (err) {
        if (err instanceof InvalidCredentilsError) {
            return reply.status(400).send({ message: err.message });
        }

        throw err;
    }
}

export const AuthenticateWithPasswordControllerSchema: FastifySchema = {
    summary: "Authenticate a user with email and password",
    body: z.object({
        email: z.email(),
        password: z.string(),
    }),
    tags: ["Auth"],
    response: {
        200: z.object({
            token: z.string(),
        }),
        400: z.object({
            message: z.string(),
        }),
    },
};

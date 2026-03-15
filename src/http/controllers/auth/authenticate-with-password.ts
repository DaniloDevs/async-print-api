import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import { InvalidCredentilsError } from "../../../service/@errors/invalid-credentials";
import { makeAuthenticateWithPassword } from "../../../service/@factory/auth/make-autheticate-with-password";

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

        return reply.status(200).send({ token });
    } catch (err) {
        if (err instanceof InvalidCredentilsError) {
            return reply.status(400).send({ message: err.message });
        }

        throw err;
    }
}

export const AuthenticateWithPasswordControllerSchema: FastifySchema = {
    summary: "Authenticate with email and password",
    description:
        "This endpoint allows a user to authenticate using their email and password. It returns a JWT token upon successful authentication.",
    body: z.object({
        email: z.email(),
        password: z.string(),
    }),
    tags: ["Auth"],
    response: {
        200: z
            .object({
                token: z.string(),
            })
            .describe("Successful authentication"),
    },
};

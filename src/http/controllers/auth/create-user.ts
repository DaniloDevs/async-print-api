import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import {
    type UserCreateInput,
    userCreateInputSchema,
} from "../../../repository/user";
import { MakeCreateUser } from "../../../service/_factory/auth/make-create-user";

export default async function CreateUserController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const data = userCreateInputSchema.parse(request.body) as UserCreateInput;

    const createUserService = MakeCreateUser();

    const { user } = await createUserService.execute({
        name: data.name,
        email: data.email,
        password: data.passwordHash,
    });

    return reply.status(201).send({
        userId: user.id,
    });
}

export const createUserControllerSchema: FastifySchema = {
    summary: "Create a new user",
    description: "This endpoint allows you to create a new user by providing their name, email, and password.",
    body: userCreateInputSchema,
    tags: ["Auth"],
    response: {
        201: z.object({
            userId: z.string(),
        }).describe("User created successfully"),
    },
};

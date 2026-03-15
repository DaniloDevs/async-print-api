import type { FastifyInstance } from "fastify";
import { VerifyJwt } from "../../middleware/verify-jwt";
import AuthenticateWithPasswordController, {
    AuthenticateWithPasswordControllerSchema,
} from "./authenticate-with-password";
import CreateUserController, {
    createUserControllerSchema,
} from "./create-user";
import { ProfileControllerSchema, profileController } from "./profile";

export default async function AuthRoutes(server: FastifyInstance) {
    server.post(
        "/auth/register",
        { schema: createUserControllerSchema },
        CreateUserController,
    );

    server.post(
        "/auth/sessions/password",
        { schema: AuthenticateWithPasswordControllerSchema },
        AuthenticateWithPasswordController,
    );

    server.get(
        "/auth/profile",
        { schema: ProfileControllerSchema, onRequest: [VerifyJwt] },
        profileController,
    );
}

import { hash } from "bcryptjs";
import { beforeEach, describe, expect, it } from "vitest";
import { UserInMemoryRepository } from "../../repository/in-memory/user";
import { InvalidCredentilsError } from "../_errors/invalid-credentials";
import { AuthenticateWithPasswordService } from "../auth/authenticate-with-password";

describe("Authenticate Services", () => {
    let repository: UserInMemoryRepository;
    let service: AuthenticateWithPasswordService;

    beforeEach(() => {
        repository = new UserInMemoryRepository();
        service = new AuthenticateWithPasswordService(repository);
    });
    it("should be able to register ", async () => {
        repository.create({
            name: "John Doe",
            email: "jhon@exemple.com",
            passwordHash: await hash("123456", 6),
        });

        const { user } = await service.execute({
            email: "jhon@exemple.com",
            password: "123456",
        });

        expect(user.id).toEqual(expect.any(String));
    });

    it("should not be albe authenticate with wrong email ", async () => {
        await expect(
            service.execute({
                email: "jhon@exemple.com",
                password: "123456",
            }),
        ).rejects.toBeInstanceOf(InvalidCredentilsError);
    });

    it("should be able to register ", async () => {
        repository.create({
            name: "John Doe",
            email: "jhon@exemple.com",
            passwordHash: await hash("123456", 6),
        });

        await expect(
            service.execute({
                email: "jhon@exemple.com",
                password: "124578",
            }),
        ).rejects.toBeInstanceOf(InvalidCredentilsError);
    });
});

import type { PrismaClient } from "../../generated/prisma/client";
import type { IUserRepository, UserCreateInput } from "../user";

export class UserPrismaRepository implements IUserRepository {
    constructor(private prisma: PrismaClient) {}

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) return null;

        return user;
    }

    async findByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) return null;

        return user;
    }

    async create(data: UserCreateInput) {
        const user = await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash: data.passwordHash,
            },
        });

        return user;
    }
}

import { randomUUID } from "node:crypto";
import type { IUserRepository, User, UserCreateInput } from "../user";

export class UserInMemoryRepository implements IUserRepository {
    public itens: User[] = [];

    async findById(id: string): Promise<User | null> {
        const user = this.itens.find((user) => user.id === id);

        return user ? user : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = this.itens.find((user) => user.email === email);

        return user ? user : null;
    }

    async create(data: UserCreateInput): Promise<User> {
        const user: User = {
            id: randomUUID(),
            name: data.name,
            email: data.email,
            passwordHash: data.passwordHash,
            createdAt: new Date(),
            role: data.role,
        };

        this.itens.push(user);

        return user;
    }
}

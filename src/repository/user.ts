import z from "zod";

const user = z.object({
    id: z.string(),
    name: z.string().min(2).max(100),
    email: z.string(),
    passwordHash: z.string(),
    createdAt: z.date(),
});

const userCreateInput = user.omit({
    id: true,
    createdAt: true,
});

export type User = z.infer<typeof user>;
export type UserCreateInput = z.infer<typeof userCreateInput>;

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: UserCreateInput): Promise<User>;
}

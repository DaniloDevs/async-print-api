import z from "zod";

export const userSchema = z.object({
    id: z.string(),
    name: z.string().min(2).max(100),
    email: z.string(),
    passwordHash: z.string(),
    createdAt: z.date(),
});

export const userCreateInputSchema = userSchema.omit({
    id: true,
    createdAt: true,
});

export type User = z.infer<typeof userSchema>;
export type UserCreateInput = z.infer<typeof userCreateInputSchema>;

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: UserCreateInput): Promise<User>;
}

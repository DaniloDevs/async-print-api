import z from "zod"

const userRoleEnum = z.enum(["admin", "member"]);

const user = z.object({
    id: z.string(),
    name: z.string().min(2).max(100),
    email: z.string(),
    passwordHash: z.string(),
    createdAt: z.date(),
    role: userRoleEnum.default("member"),
});


const userCreateInput = user.omit({
    id: true,
    createdAt: true,
    role: true,
});

export type User = z.infer<typeof user>;
export type UserCreateInput = z.infer<typeof userCreateInput>;
export type UserRoleEnum = z.infer<typeof userRoleEnum>;


export interface IUserRepository {
    findById(id: string): Promise<User | null>
    findByEmail(email: string): Promise<User | null>
    create(data: UserCreateInput): Promise<User>
}

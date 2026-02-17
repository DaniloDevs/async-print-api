import { env } from "../env";
import { PrismaClient } from "../generated/prisma/client";

export const prisma = new PrismaClient({
    accelerateUrl: env.DATABASE_URL,
});

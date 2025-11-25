import "dotenv";
import z from "zod";

const envSchema = z.object({
	PORT: z.number().default(3333),
	REDIS_HOST: z.string().default("127.0.0.1"),
	REDIS_PORT: z.number().default(6379),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
	console.error(
		"❌ Invalid environment variables:",
		_env.error.issues.forEach((issue) => {
			console.log(issue.path, issue.message);
		}),
	);
	throw new Error("Invalid environment variables:\n");
}

export const env = _env.data;

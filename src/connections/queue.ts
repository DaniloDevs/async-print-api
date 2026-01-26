import { Queue } from "bullmq";
import { env } from "../env";
import type { Ticket } from "../types/ticket";

export const queue = new Queue<Ticket>("leads-enqueue", {
    connection: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
    },
});

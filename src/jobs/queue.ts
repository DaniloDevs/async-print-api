import { Queue } from "bullmq";
import { env } from "../env";

export const queue = new Queue("leads-enqueue", {
   connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT
   },
});

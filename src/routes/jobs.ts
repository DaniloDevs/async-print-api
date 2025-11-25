import type { FastifyInstance } from "fastify";
import { queue } from "../jobs/queue";


export default async function jobsRoute(app: FastifyInstance) {
   app.get("/jobs/create", async () => {
      await queue.add("test", { msg: "hello world" });

      return { status: "job added" };
   });

   app.get("/jobs/active", async () => {
      return queue.getActive();
   });

   app.get("/jobs/completed", async () => {
      return queue.getCompleted();
   });

   app.get("/jobs/failed", async () => {
      return queue.getFailed();
   });

   app.get("/jobs/waiting", async () => {
      return queue.getWaiting();
   });
} 


import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { queue } from "../../jobs/queue";
import { leadSchema } from "../../types/lead";
import z from "zod";


export default async function CreateLeads(app: FastifyInstance) {
   app
      .withTypeProvider<ZodTypeProvider>()
      .post("/leads", {
         schema: {
            summary: "Create Lead",
            tags: ["Leads"],
            description: "Create a new lead",
            body: leadSchema
         }
      }, async (request, reply) => {
         const { age, name, event, cellphone } = request.body

         // Salvar user 
         const job = await queue.add("capture lead", { event, name, age, cellphone });

         return reply.status(201).send({
            message: "Create user",
            jobId: job.id
         })
      });
} 
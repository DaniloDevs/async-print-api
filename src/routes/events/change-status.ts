import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prisma } from "../../connections/prisma";
import z from "zod";

export async function ChangeStatus(app: FastifyInstance) {
   app
      .withTypeProvider<ZodTypeProvider>()
      .patch('/events/:id/status', {
         schema: {
            summary: "Change the current Event Status",
            tags: ["Events"],
            description: "Updates the active status of an event",
            params: z.object({ id: z.string() }),
            body: z.object({
               active: z.boolean()
            })
         }
      }, async (request, reply) => {
         const { id } = request.params;
         const { active } = request.body;

         // Verifica se existe
         const exists = await prisma.events.findUnique({ where: { id } });

         if (!exists) {
            return reply.code(404).send({ error: "Event not found" });
         }

         const updated = await prisma.events.update({
            where: { id },
            data: { active }
         });

         return reply.code(200).send(updated);
      });
}
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prisma } from "../../connections/prisma";
import z from "zod";

export async function UpdateEventStatus(app: FastifyInstance) {
   app
      .withTypeProvider<ZodTypeProvider>()
      .patch('/events/:id/status', {
         schema: {
            summary: "Update event activation status",
            tags: ["Events"],
            description: "Toggles the operational state of a specific event identified by its ID. Updates the `active` flag to enable or disable the event's availability and visibility in the system.",
            params: z.object({ id: z.string().describe("The unique identifier of the event") }),
            body: z.object({
               active: z.boolean().describe("Determines if the event is live (true) or disabled (false)")
            }),
            response: {
               200: z.void(),
               404: z.object({
                  message: z.string()
               }),
            }
         }
      }, async (request, reply) => {
         const { id } = request.params;
         const { active } = request.body;

         // Verifica se existe
         const exists = await prisma.events.findUnique({ where: { id } });

         if (!exists) {
            return reply.code(404).send({ message: "Event not found" });
         }

         await prisma.events.update({
            where: { id },
            data: { active }
         });

         return reply.code(200).send();
      });
}
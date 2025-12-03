import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prisma } from "../../connections/prisma";
import z from "zod";

export async function FetchLeadsByEvent(app: FastifyInstance) {
   app
      .withTypeProvider<ZodTypeProvider>()
      .get('/events/:id/leads', {
         schema: {
            summary: "Fetch leads by Event",
            tags: ["Events"],
            description: "Fetch All Events",
            params: z.object({
               id: z.string()
            })
         }
      }, async (request, reply) => {
         const { id } = request.params

         const events = await prisma.events.findUnique({
            where: {id},
            select: {
               _count: true,
               leads: {
                  select: {
                     name: true,
                     cellphone: true
                  }
               }
            }
         })

         return reply.code(200).send({
            events,
         });
      });
}
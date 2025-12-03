import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prisma } from "../../connections/prisma";
import z from "zod";

export async function ListEvents(app: FastifyInstance) {
   app
      .withTypeProvider<ZodTypeProvider>()
      .get('/events', {
         schema: {
            summary: "List events",
            tags: ["Events"],
            description: "Retrieves a collection of registered events. Returns an array containing the essential details and current state of each event available in the system.",
            response: {
               200: z.object({
                  events: z.object({
                     id: z.string(),
                     title: z.string(),
                     bannerURL: z.string().nullable(),
                     createdAt: z.date(),
                     _count: z.object({
                        leads: z.number()
                     })
                  }).array()
               })
            }
         }
      }, async (_, reply) => {

         const events = await prisma.events.findMany({
            select: {
               id: true,
               title: true,
               bannerURL: true,
               createdAt: true,
               _count: {
                  select: { leads: true }
               }
            }
         })

         return reply.code(200).send({
            events,
         });
      });
}
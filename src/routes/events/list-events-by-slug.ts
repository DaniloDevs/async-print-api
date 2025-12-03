import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../connections/prisma";
import z from "zod";


export default async function ListEventsBySlug(app: FastifyInstance) {
   app
      .withTypeProvider<ZodTypeProvider>()
      .get('/events/:slug', {
         schema: {
            summary: "Retrieve event by slug",
            tags: ["Events"],
            description: "Retrieves the details of a specific event using its unique, URL-friendly slug. This endpoint is typically used to render public-facing event pages and ensures SEO-friendly URLs.",
            params: z.object({
               slug: z.string()
            }),
            response: {
               200: z.object({
                  events: z.object({
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
      }, async (request, reply) => {
         const { slug } = request.params

         const events = await prisma.events.findMany({
            where: { slug },
            select: {
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
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../connections/prisma";
import z from "zod";
import dayjs from "dayjs";


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
                  event: z.object({
                     title: z.string(),
                     bannerURL: z.string().nullable(),
                     createdAt: z.string(),
                     startIn: z.string(),
                     endIn: z.string(),
                     _count: z.object({
                        leads: z.number()
                     })
                  })
               }),
               404: z.object({
                  message: z.string()
               }),
            }
         }
      }, async (request, reply) => {
         const { slug } = request.params

         const event = await prisma.events.findUnique({
            where: { slug },
            select: {
               title: true,
               bannerURL: true,
               createdAt: true,
               endIn: true,
               startIn: true,
               _count: { select: { leads: true } }
            }
         })

         if (!event) {
            return reply.code(404).send({
               message: "Evento não encontrado"
            })
         }

         const formattedEvent = {
            ...event,
            startIn: dayjs(event.startIn).format("HH:mm"),
            endIn: dayjs(event.endIn).format("HH:mm"),
            createdAt: dayjs(event.createdAt).format('dd/mm/yyyy')
         }
         return reply.code(200).send({ event: formattedEvent })

      });
}
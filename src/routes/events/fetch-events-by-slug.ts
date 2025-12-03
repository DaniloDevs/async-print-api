import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../connections/prisma";
import z from "zod";


export default async function FetchEventsBySlug(app: FastifyInstance) {
   app
      .withTypeProvider<ZodTypeProvider>()
      .get('/events/:slug', {
         schema: {
            summary: "Fetch Events By Slug",
            tags: ["Events"],
            description: "Fetch All Events",
            params: z.object({
               slug: z.string()
            })
         }
      }, async (request, reply) => {
         const { slug } = request.params

         const events = await prisma.events.findFirst({
            where: { slug }
         })

         return reply.code(200).send({
            events,
         });
      });
}
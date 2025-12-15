import dayjs from "dayjs";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { s3 } from "../../connections/minio";
import { prisma } from "../../connections/prisma";
import { getImageFromS3ByKey } from "../../utils/get-banner-url";

export async function ListEvents(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/events",
    {
      schema: {
        summary: "List events",
        tags: ["Events"],
        description:
          "Retrieves a collection of registered events. Returns an array containing the essential details and current state of each event available in the system.",
        response: {
          200: z.object({
            events: z
              .object({
                id: z.string(),
                title: z.string(),
                bannerURL: z.string().nullable(),
                slug: z.string(),
                startIn: z.string(),
                endIn: z.string(),
                _count: z.object({
                  leads: z.number(),
                }),
              })
              .array(),
          }),
        },
      },
    },
    async (_, reply) => {
      const events = await prisma.events.findMany({
        select: {
          id: true,
          title: true,
          bannerURL: true,
          endIn: true,
          startIn: true,
          slug: true,
          _count: {
            select: { leads: true },
          },
        },
      });

      const eventsWithBanner = await Promise.all(
        events.map(async (event) => {
          let signedUrl: string | null = null;

          if (event.bannerURL) {
            signedUrl = await getImageFromS3ByKey(event.bannerURL, s3);
          }

          return {
            ...event,
            startIn: dayjs(event.startIn).format("HH:mm"),
            endIn: dayjs(event.endIn).format("HH:mm"),
            bannerURL: signedUrl,
          };
        }),
      );

      return reply.code(200).send({
        events: eventsWithBanner,
      });
    },
  );
}

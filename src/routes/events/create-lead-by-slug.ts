import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../connections/prisma";
import { queue } from "../../connections/queue";
import { leadSchema } from "../../types/lead";

export default async function CreateLeadsBySlug(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        "/:eventSlug/leads",
        {
            schema: {
                summary: "Register new lead",
                tags: ["Events"],
                description:
                    "Registers a new lead in the database and enqueues a background task for further processing (e.g., CRM sync, welcome email). Returns the Job ID to allow tracking of the asynchronous operation status.",
                body: leadSchema,
                params: z.object({
                    eventSlug: z.string(),
                }),
                response: {
                    201: z.object({
                        message: z.string(),
                    }),
                    400: z.object({
                        message: z.string(),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { name, cellphone, isValid } = request.body;
            const { eventSlug } = request.params;

            const event = await prisma.events.findUnique({
                where: { slug: eventSlug },
                select: {
                    bannerURL: true,
                },
            });

            if (!event)
                return reply.status(400).send({ message: "Event not found!" });

            await prisma.leads.create({
                data: {
                    name,
                    cellphone,
                    events: {
                        connect: {
                            slug: eventSlug,
                        },
                    },
                    isValid,
                    createdAt: new Date(),
                },
            });

            // Salvar user
            await queue.add("capture lead", {
                name,
                cellphone,
                bannerURL: event?.bannerURL!,
            });

            return reply.status(201).send({
                message: "Create Lead",
            });
        },
    );
}

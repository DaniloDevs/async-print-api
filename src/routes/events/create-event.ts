import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../connections/prisma";
import { createSlug } from "../../utils/create-slug";

export async function CreateEvent(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        "/events",
        {
            schema: {
                summary: "Create new event",
                tags: ["Events"],
                description:
                    "Registers a new event resource in the system. Initializes the event with the provided details and assigns a unique identifier. Returns the newly created event object.",
                body: z.object({
                    title: z.string().min(1),
                    active: z.boolean().default(true),
                    startIn: z.string(),
                    endIn: z.string(),
                }),
                response: {
                    201: z.object({
                        id: z.string(),
                        slug: z.string(),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { title, active, endIn, startIn } = request.body;

            const event = await prisma.events.create({
                data: {
                    title,
                    slug: createSlug(title),
                    active,
                    createdAt: new Date(),
                    startIn: new Date(startIn),
                    endIn: new Date(endIn),
                },
            });

            return reply.code(201).send({ id: event.id, slug: event.slug });
        },
    );
}

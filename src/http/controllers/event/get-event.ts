import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import { eventSchema } from "./../../../repository/event";
import { makeGetEvent } from "../../../service/_factory/event/make-get-event";

export default async function GetEventController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const { slug } = request.params as { slug: string };

    const getEvent = makeGetEvent();

    const { event } = await getEvent.execute({
        slug,
    });

    return reply.status(200).send({
        event,
    });
}

export const getEventControllerSchema: FastifySchema = {
    summary: "Get event by params",
    params: z.object({
        slug: z.string(),
    }),
    tags: ["Events"],
    response: {
        201: z.object({
            event: eventSchema,
        }),
    },
};

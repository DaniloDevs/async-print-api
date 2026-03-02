import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import { eventSchema } from "./../../../repository/event";
import { makeListEvents } from "../../../service/_factory/event/make-list-events";

export default async function ListEventsController(
    _request: FastifyRequest,
    reply: FastifyReply,
) {
    const listEvents = makeListEvents();

    const { events } = await listEvents.execute();

    return reply.status(200).send({
        events,
    });
}

export const listEventsControllerSchema: FastifySchema = {
    summary: "List events",
    description: "Endpoint to list all events in the system.",
    security: [{ bearerAuth: [] }],
    tags: ["Events"],
    response: {
        200: z
            .object({
                events: z.array(
                    eventSchema
                        .omit({
                            bannerKey: true,
                        })
                        .extend({
                            bannerUrl: z.string().nullable(),
                        }),
                ),
            })
            .describe("Successful retrieval of events"),
    },
};

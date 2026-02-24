import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import { eventSchema, eventStatusSchema } from "./../../../repository/event";
import { makeUpdateEventStatus } from "../../../service/_factory/event/make-update-event-status";

export default async function UpdateEventStatusController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const { eventId } = request.params as { eventId: string };
    const { newStatus } = request.body as { newStatus: string };

    const updateEventStatus = makeUpdateEventStatus();

    const { event } = await updateEventStatus.execute({
        eventId,
        newStatus: newStatus as z.infer<typeof eventStatusSchema>,
    });

    return reply.status(200).send({
        event,
    });
}

export const updateEventStatusControllerSchema: FastifySchema = {
    summary: "Update event status",
    description: "Endpoint to update the status of an existing event.",
    security: [{ bearerAuth: [] }],
    params: z.object({
        eventId: z.string(),
    }),
    body: z.object({
        newStatus: eventStatusSchema,
    }),
    tags: ["Events"],
    response: {
        200: z
            .object({
                event: eventSchema,
            })
            .describe("Successful update of event status"),
    },
};

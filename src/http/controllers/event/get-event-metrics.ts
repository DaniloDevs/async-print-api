import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import { eventStatusSchema } from "./../../../repository/event";
import { makeGetEventMetrics } from "../../../service/_factory/event/make-get-event-metrics";

export default async function GetEventMetricsController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const { eventId } = request.params as { eventId: string };

    const getEventMetrics = makeGetEventMetrics();

    const { currentLeads, totalLeads, eventStatus } =
        await getEventMetrics.execute({
            eventId,
        });

    return reply.status(200).send({
        currentLeads,
        totalLeads,
        eventStatus,
    });
}

export const getEventMetricsControllerSchema: FastifySchema = {
    summary: "Get event metrics",
    params: z.object({
        eventId: z.string(),
    }),
    security: [{ cookieAuth: [] }],
    tags: ["Events"],
    response: {
        201: z.object({
            currentLeads: z.number(),
            totalLeads: z.number(),
            eventStatus: eventStatusSchema,
        }),
    },
};

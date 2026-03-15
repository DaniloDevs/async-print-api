import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import { makeGetLeadCaptureMetrics } from "../../../service/@factory/leads/make-get-lead-capture-metrics";

export default async function GetLeadCaptureMetricsController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const paramsSchema = z.object({
        eventId: z.string().uuid(),
    });

    const { eventId } = paramsSchema.parse(request.params);

    const getLeadCaptureMetrics = makeGetLeadCaptureMetrics();

    const result = await getLeadCaptureMetrics.execute({
        eventId,
    });

    return reply.status(200).send(result);
}

export const getLeadCaptureMetricsControllerSchema: FastifySchema = {
    summary: "Get lead capture metrics",
    tags: ["Leads"],
    params: z.object({
        eventId: z.string().uuid().describe("The ID of the event"),
    }),
};

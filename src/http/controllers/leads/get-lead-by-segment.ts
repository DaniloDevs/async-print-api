import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import { makeGetLeadMetricsBySegment } from "../../../service/@factory/leads/make-get-lead-by-segment";

export default async function GetLeadMetricsBySegmentController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const paramsSchema = z.object({
        eventId: z.string().uuid(),
    });

    const { eventId } = paramsSchema.parse(request.params);

    const getLeadMetricsBySegment = makeGetLeadMetricsBySegment();

    const result = await getLeadMetricsBySegment.execute({
        eventId,
    });

    return reply.status(200).send(result);
}

export const getLeadMetricsBySegmentControllerSchema: FastifySchema = {
    summary: "Get lead metrics by segment",
    tags: ["Leads"],
    params: z.object({
        eventId: z.string().uuid().describe("The ID of the event"),
    }),
};

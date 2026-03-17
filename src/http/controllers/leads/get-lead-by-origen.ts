import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import { makeGetLeadMetricsByOrigen } from "../../../service/@factory/leads/make-get-lead-by-origen";

export default async function GetLeadMetricsByOriginController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const paramsSchema = z.object({
        eventId: z.string().uuid(),
    });

    const { eventId } = paramsSchema.parse(request.params);

    const getLeadMetricsByOrigin = makeGetLeadMetricsByOrigen();

    const result = await getLeadMetricsByOrigin.execute({
        eventId,
    });

    return reply.status(200).send(result);
}

export const getLeadMetricsByOriginControllerSchema: FastifySchema = {
    summary: "Get lead metrics by origin",
    tags: ["Leads"],
    params: z.object({
        eventId: z.string().uuid().describe("The ID of the event"),
    }),
};

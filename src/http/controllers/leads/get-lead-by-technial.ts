import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import { makeGetLeadMetricsByTechnial } from "../../../service/@factory/leads/make-get-lead-by-technial";

export default async function GetLeadMetricsByTechnicalController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const paramsSchema = z.object({
        eventId: z.string().uuid(),
    });

    const { eventId } = paramsSchema.parse(request.params);

    const getLeadMetricsByTechnical = makeGetLeadMetricsByTechnial();

    const result = await getLeadMetricsByTechnical.execute({
        eventId,
    });

    return reply.status(200).send(result);
}

export const getLeadMetricsByTechnicalControllerSchema: FastifySchema = {
    summary: "Get lead metrics by technical",
    tags: ["Leads"],
    params: z.object({
        eventId: z.string().uuid().describe("The ID of the event"),
    }),
};

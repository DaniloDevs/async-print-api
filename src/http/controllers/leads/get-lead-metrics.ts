import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import { makeGetMetricsOverview } from "../../../service/@factory/leads/make-get-metrics-overview";

export default async function GetMetricsOverviewController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const paramsSchema = z.object({
        slug: z.string(),
    });

    const { slug } = paramsSchema.parse(request.params);

    const getMetricsOverview = makeGetMetricsOverview();

    const result = await getMetricsOverview.execute({
        slug,
    });

    return reply.status(200).send(result);
}

export const getLeadCaptureMetricsControllerSchema: FastifySchema = {
    summary: "Get lead capture metrics",
    tags: ["Leads"],
    params: z.object({
        slug: z.string().describe("The ID of the event"),
    }),
    response: {
        200: z.object({
            totalLeads: z.number(),
            currentLeads: z.number(),
            catchPercentage: z.number(),
            averageTotals: z.number(),
        }),
    },
};

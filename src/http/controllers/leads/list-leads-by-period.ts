import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import { makeListLeadsByPeriod } from "../../../service/@factory/leads/make-list-leads-by-period";

export default async function ListLeadsByPeriodController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const { eventId } = request.params as { eventId: string };

    const listLeadsByPeriodService = makeListLeadsByPeriod();

    const { leads } = await listLeadsByPeriodService.execute({
        eventId,
    });

    return reply.status(200).send({ leads });
}

export const listLeadsByPeriodControllerSchema: FastifySchema = {
    summary: "Get event by params",
    params: z.object({
        eventId: z.string(),
    }),
    tags: ["Leads"],
    response: {
        200: z
            .object({
                leads: z.array(
                    z.object({
                        hour: z.string(),
                        total: z.number(),
                    }),
                ),
            })
            .describe("Successful retrieval of leads by period"),
    },
};

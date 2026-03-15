import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import { makeListEventLeads } from "../../../service/@factory/leads/make-list-event-leads";

export default async function ListEventLeadsController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const paramsSchema = z.object({
        slug: z.string(),
    });

    const { slug } = paramsSchema.parse(request.params);

    const listEventLeads = makeListEventLeads();

    const result = await listEventLeads.execute({
        slug,
    });

    return reply.status(200).send({ leads: result.leads });
}

export const listEventLeadsControllerSchema: FastifySchema = {
    summary: "List event leads",
    tags: ["Leads"],
    params: z.object({
        slug: z.string().describe("The slug of the event"),
    }),
};

import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import { makeExportEventLeads } from "../../../service/@factory/leads/make-export-event-leads";

export default async function ExportEventLeadsController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const paramsSchema = z.object({
        slug: z.string(),
    });

    const { slug } = paramsSchema.parse(request.params);

    const exportEventLeads = makeExportEventLeads();

    const result = await exportEventLeads.execute({
        slug,
    });

    return reply.status(200).send(result);
}

export const exportEventLeadsControllerSchema: FastifySchema = {
    summary: "Export event leads",
    tags: ["Leads"],
    params: z.object({
        slug: z.string().describe("The slug of the event"),
    }),
};

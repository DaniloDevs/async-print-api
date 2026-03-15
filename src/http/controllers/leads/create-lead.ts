import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import {
    type LeadCreateInput,
    leadCreateInputSchema,
} from "../../../repository/lead";
import { makeCreateLead } from "../../../service/@factory/leads/make-create-lead";

export default async function CreateLeadController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const data = request.body as { lead: LeadCreateInput };

    const fomartData = leadCreateInputSchema.parse(data.lead);
    const createLead = makeCreateLead();

    const { lead } = await createLead.execute({
        data: fomartData,
    });

    return reply.status(200).send({ lead });
}

export const createLeadControllerSchema: FastifySchema = {
    summary: "Create lead",
    body: z.object({
        lead: leadCreateInputSchema,
    }),
    tags: ["Leads"],
    // response: {
    //      200: z
    //           .object({
    //                leads: z.array(
    //                     z.object({
    //                          hour: z.string(),
    //                          total: z.number(),
    //                     }),
    //                ),
    //           })
    //           .describe("Successful retrieval of leads by period"),
    // },
};

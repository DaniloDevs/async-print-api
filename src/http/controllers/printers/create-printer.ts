import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import { printerCreateInputSchema } from "../../../repository/printer";
import { makeCreatePrinter } from "../../../service/@factory/printers/make-create-printer";

export default async function CreatePrinterController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const data = request.body as { data: z.infer<typeof printerCreateInputSchema> };

    const formatData = printerCreateInputSchema.parse(data.data);
    const createPrinter = makeCreatePrinter();

    const result = await createPrinter.execute({
        data: formatData,
    });

    return reply.status(200).send(result);
}

export const createPrinterControllerSchema: FastifySchema = {
    summary: "Create printer",
    tags: ["Printers"],
    body: z.object({
        data: printerCreateInputSchema,
    }),
};

import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import { makeGetPrinterQueue } from "../../../service/@factory/printers/make-get-printer-queue";

export default async function GetPrinterQueueController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const paramsSchema = z.object({
        printerId: z.string().uuid(),
        eventId: z.string().uuid(),
    });

    const { printerId, eventId } = paramsSchema.parse(request.params);

    const getPrinterQueue = makeGetPrinterQueue();

    const result = await getPrinterQueue.execute({
        printerId,
        eventId,
    });

    return reply.status(200).send(result);
}

export const getPrinterQueueControllerSchema: FastifySchema = {
    summary: "Get printer queue",
    tags: ["Printers"],
    params: z.object({
        printerId: z.string().uuid().describe("The ID of the printer"),
        eventId: z.string().uuid().describe("The ID of the event"),
    }),
};

import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import { makeListEventPrinters } from "../../../service/@factory/printers/make-list-event-printers";

export default async function ListEventPrintersController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const paramsSchema = z.object({
        eventId: z.string().uuid(),
    });

    const { eventId } = paramsSchema.parse(request.params);

    const listEventPrinters = makeListEventPrinters();

    const result = await listEventPrinters.execute({
        eventId,
    });

    return reply.status(200).send(result);
}

export const listEventPrintersControllerSchema: FastifySchema = {
    summary: "List event printers",
    tags: ["Printers"],
    params: z.object({
        eventId: z.string().uuid().describe("The ID of the event"),
    }),
};

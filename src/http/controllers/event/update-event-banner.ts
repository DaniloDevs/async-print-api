import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import { makeUpdateEventBannerService } from "../../../service/_factory/event/make-update-event-banner";

export default async function UpdateEventBannerController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const { eventId } = request.params as { eventId: string };
    const updateEventBanner = makeUpdateEventBannerService();
    const file = await request.file();

    if (!file) {
        return reply.status(400).send({
            error: "No file uploaded",
        });
    }

    await updateEventBanner.execute({
        eventId,
        file: {
            filename: file?.filename,
            mimetype: file?.mimetype,
            buffer: await file?.toBuffer(),
        },
    });

    return reply.status(200).send();
}

export const updateEventBannerControllerSchema: FastifySchema = {
    summary: "Update event banner",
    tags: ["Events"],
    consumes: ["multipart/form-data"],
    params: z.object({
        eventId: z.string(),
    }),
    security: [{ cookieAuth: [] }],
    body: z.object({
        file: z.any(), // multipart file
    }),
    response: {
        200: z.null(),
        400: z.object({
            error: z.string(),
        }),
    },
};

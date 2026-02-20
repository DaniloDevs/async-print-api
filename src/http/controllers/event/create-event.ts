import type { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import z from "zod";
import {
    type EventCreateInput,
    eventCreateInputSchema,
} from "./../../../repository/event";
import { makeCreateEvent } from "../../../service/_factory/event/make-create-event";

export default async function CreateEventController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const data = eventCreateInputSchema.parse(request.body) as EventCreateInput;

    const createEventService = makeCreateEvent();

    const { event } = await createEventService.execute({
        data,
    });

    return reply.status(201).send({
        eventId: event.id,
    });
}

export const createEventControllerSchema: FastifySchema = {
    summary: "Create a new event",
    body: eventCreateInputSchema,
    tags: ["Events"],
    response: {
        201: z.object({
            eventId: z.string(),
        }),
    },
};

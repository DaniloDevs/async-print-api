import { prisma } from "../../lib/prisma";
import { EventPrismaRepository } from "../../repository/prisma/event";
import { CreateEventService } from "../create-event";

export function makeCreateEvent() {
    const eventRepository = new EventPrismaRepository(prisma);
    const service = new CreateEventService(eventRepository);

    return service;
}

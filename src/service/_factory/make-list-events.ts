import { prisma } from "../../lib/prisma";
import { EventPrismaRepository } from "../../repository/prisma/event";
import { ListEventsService } from "../list-events";

export function makeListEvents() {
    const eventRepository = new EventPrismaRepository(prisma);
    const service = new ListEventsService(eventRepository);

    return service;
}

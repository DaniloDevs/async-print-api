import { prisma } from "../../../lib/prisma";
import { EventPrismaRepository } from "../../../repository/prisma/event";
import { UpdateEventStatusService } from "../../event/update-event-status";

export function makeUpdateEventStatus() {
    const eventRepository = new EventPrismaRepository(prisma);
    const service = new UpdateEventStatusService(eventRepository);

    return service;
}

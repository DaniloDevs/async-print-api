import { prisma } from "../../lib/prisma";
import { EventPrismaRepository } from "../../repository/prisma/event";
import { LeadPrismaRepository } from "../../repository/prisma/leads";
import { GetEventMetricsService } from "../get-event-metrics";

export function makeGetEventMetrics() {
    const eventRepository = new EventPrismaRepository(prisma);
    const leadRepository = new LeadPrismaRepository(prisma);
    const service = new GetEventMetricsService(eventRepository, leadRepository);

    return service;
}

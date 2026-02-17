import { prisma } from "../../lib/prisma";
import { EventPrismaRepository } from "../../repository/prisma/event";
import { LeadPrismaRepository } from "../../repository/prisma/leads";
import { ListEventLeadsByPeriodService } from "../list-event-leads-by-period";

export function makeListEventLeadsByPeriod() {
    const eventRepository = new EventPrismaRepository(prisma);
    const leadRepository = new LeadPrismaRepository(prisma);
    const service = new ListEventLeadsByPeriodService(
        eventRepository,
        leadRepository,
    );

    return service;
}

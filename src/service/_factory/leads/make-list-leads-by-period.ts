import { prisma } from "../../../lib/prisma";
import { EventPrismaRepository } from "../../../repository/prisma/event";
import { LeadPrismaRepository } from "../../../repository/prisma/leads";
import { ListEventLeadsByPeriodService } from "../../leads/list-leads-by-period";

export function makeListLeadsByPeriod() {
    const eventRepository = new EventPrismaRepository(prisma);
    const leadRepository = new LeadPrismaRepository(prisma);
    const service = new ListEventLeadsByPeriodService(
        eventRepository,
        leadRepository,
    );

    return service;
}

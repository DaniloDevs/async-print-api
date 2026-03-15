import { prisma } from "../../../lib/prisma";
import { EventPrismaRepository } from "../../../repository/prisma/event";
import { LeadPrismaRepository } from "../../../repository/prisma/leads";
import { ListEventLeadsService } from "../../leads/list-event-leads";

export function makeListEventLeads() {
    const eventRepository = new EventPrismaRepository(prisma);
    const leadRepository = new LeadPrismaRepository(prisma);
    const service = new ListEventLeadsService(
        eventRepository,
        leadRepository,
    );

    return service;
}

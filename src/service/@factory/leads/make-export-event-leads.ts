import { prisma } from "../../../lib/prisma";
import { EventPrismaRepository } from "../../../repository/prisma/event";
import { LeadPrismaRepository } from "../../../repository/prisma/leads";
import { ExportEventLeadsService } from "../../leads/export-event-leads";

export function makeExportEventLeads() {
    const eventRepository = new EventPrismaRepository(prisma);
    const leadRepository = new LeadPrismaRepository(prisma);
    const service = new ExportEventLeadsService(
        eventRepository,
        leadRepository,
    );

    return service;
}

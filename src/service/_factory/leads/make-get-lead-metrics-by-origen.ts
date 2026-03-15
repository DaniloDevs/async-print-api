import { prisma } from "../../../lib/prisma";
import { EventPrismaRepository } from "../../../repository/prisma/event";
import { LeadPrismaRepository } from "../../../repository/prisma/leads";
import { GetLeadMetricsByorigin } from "../../leads/get-lead-metrics-by-origen";

export function makeGetLeadMetricsByOrigen() {
    const eventRepository = new EventPrismaRepository(prisma);
    const leadRepository = new LeadPrismaRepository(prisma);
    const service = new GetLeadMetricsByorigin(
        eventRepository,
        leadRepository,
    );

    return service;
}

import { prisma } from "../../../lib/prisma";
import { EventPrismaRepository } from "../../../repository/prisma/event";
import { LeadPrismaRepository } from "../../../repository/prisma/leads";
import { GetLeadMetricsByTechnical } from "../../leads/get-lead-metrics-by-technial";

export function makeGetLeadMetricsByTechnial() {
    const eventRepository = new EventPrismaRepository(prisma);
    const leadRepository = new LeadPrismaRepository(prisma);
    const service = new GetLeadMetricsByTechnical(
        eventRepository,
        leadRepository,
    );

    return service;
}

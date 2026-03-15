import { prisma } from "../../../lib/prisma";
import { EventPrismaRepository } from "../../../repository/prisma/event";
import { LeadPrismaRepository } from "../../../repository/prisma/leads";
import { GetLeadMetricsBySegment } from "../../leads/get-lead-metrics-by-segment";

export function makeGetLeadMetricsBySegment() {
    const eventRepository = new EventPrismaRepository(prisma);
    const leadRepository = new LeadPrismaRepository(prisma);
    const service = new GetLeadMetricsBySegment(
        eventRepository,
        leadRepository,
    );

    return service;
}

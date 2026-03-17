import { prisma } from "../../../lib/prisma";
import { EventPrismaRepository } from "../../../repository/prisma/event";
import { LeadPrismaRepository } from "../../../repository/prisma/leads";
import { GetMetricsOverview } from "../../leads/get-metrics-overview";

export function makeGetMetricsOverview() {
    const eventRepository = new EventPrismaRepository(prisma);
    const leadRepository = new LeadPrismaRepository(prisma);
    const service = new GetMetricsOverview(eventRepository, leadRepository);

    return service;
}

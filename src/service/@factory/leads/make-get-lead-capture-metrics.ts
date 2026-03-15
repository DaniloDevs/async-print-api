import { prisma } from "../../../lib/prisma";
import { EventPrismaRepository } from "../../../repository/prisma/event";
import { LeadPrismaRepository } from "../../../repository/prisma/leads";
import { GetLeadCaptureMetricsService } from "../../leads/get-lead-capture-metrics";

export function makeGetLeadCaptureMetrics() {
    const eventRepository = new EventPrismaRepository(prisma);
    const leadRepository = new LeadPrismaRepository(prisma);
    const service = new GetLeadCaptureMetricsService(
        eventRepository,
        leadRepository,
    );

    return service;
}

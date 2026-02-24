import { prisma } from "../../../lib/prisma";
import { EventPrismaRepository } from "../../../repository/prisma/event";
import { JobPrismaRepository } from "../../../repository/prisma/job";
import { LeadPrismaRepository } from "../../../repository/prisma/leads";
import { CreateLeadService } from "../../create-lead";

export function makeCreateLead() {
    const eventRepository = new EventPrismaRepository(prisma);
    const leadRepository = new LeadPrismaRepository(prisma);
    const jobRepository = new JobPrismaRepository(prisma);
    const service = new CreateLeadService(
        eventRepository,
        leadRepository,
        jobRepository,
    );

    return service;
}

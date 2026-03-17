import { prisma } from "../../../lib/prisma";
import { BullMQJobProvider } from "../../../provider/job-provider";
import { EventPrismaRepository } from "../../../repository/prisma/event";
import { JobPrismaRepository } from "../../../repository/prisma/job";
import { LeadPrismaRepository } from "../../../repository/prisma/leads";
import { CreateLeadService } from "../../leads/create-lead";

export function makeCreateLead() {
    const eventRepository = new EventPrismaRepository(prisma);
    const leadRepository = new LeadPrismaRepository(prisma);
    const jobRepository = new JobPrismaRepository(prisma);
    const jobProvider = new BullMQJobProvider();
    const service = new CreateLeadService(
        eventRepository,
        leadRepository,
        jobRepository,
        jobProvider,
    );

    return service;
}

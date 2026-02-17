import type { PrismaClient } from "../../generated/prisma/client";
import type { ILeadRepository, Lead, LeadCreateInput } from "../lead";

export class LeadPrismaRepository implements ILeadRepository {
    constructor(private prisma: PrismaClient) {}

    async create(data: LeadCreateInput): Promise<Lead> {
        const lead = await this.prisma.lead.create({
            data: {
                name: data.name,
                phone: data.phone,
                email: data.email,
                intentionNextYear: data.intentionNextYear,
                technical: data.technical,
                segment: data.segment,
                origin: data.origin,
                eventId: data.eventId,
            },
        });

        return lead;
    }

    async findByEmailAndEventId(
        email: string,
        eventId: string,
    ): Promise<Lead | null> {
        return this.prisma.lead.findUnique({
            where: {
                email_eventId: {
                    email,
                    eventId,
                },
            },
        });
    }

    async findManyByEventId(eventId: string): Promise<Lead[]> {
        return this.prisma.lead.findMany({
            where: {
                eventId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
}

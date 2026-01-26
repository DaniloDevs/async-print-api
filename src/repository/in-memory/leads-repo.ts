import dayjs from "dayjs";
import type { Lead, LeadCreateInput,ILeadRepository } from "../lead";

export class LeadInMemoryRepository implements ILeadRepository {
    public items: Lead[] = [];

    async create(data: LeadCreateInput): Promise<Lead> {
        const leads: Lead = {
            id: crypto.randomUUID(),
            name: data.name,
            phone: data.phone,
            email: data.email,
            isStudent: data.isStudent,
            intendsToStudyNextYear: data.intendsToStudyNextYear,
            technicalInterest: data.technicalInterest,
            segmentInterest: data.segmentInterest,
            createdAt: dayjs().toDate(),
            eventId: data.eventId,
        };

        this.items.push(leads);

        return leads;
    }

    async findByEmailAndEventId(
        email: string,
        eventId: string,
    ): Promise<Lead | null> {
        const leads = this.items.find(
            (item) => item.email === email || item.eventId === eventId,
        );

        return leads || null;
    }

    async findManyByEventId(eventId: string): Promise<Lead[]> {
        const leads = this.items.filter((item) => item.eventId === eventId);

        return leads;
    }
}

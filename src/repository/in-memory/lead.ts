import dayjs from "dayjs";
import type { ILeadrepository, Lead, LeadCreateInput } from "../lead";

export class LeadInMemomryRepository implements ILeadrepository {
    public items: Lead[] = [];

    async create(data: LeadCreateInput): Promise<Lead> {
        const lead: Lead = {
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

        this.items.push(lead);

        return lead;
    }

    async findByEmailAndEventId(
        email: string,
        eventId: string,
    ): Promise<Lead | null> {
        const lead = this.items.find(
            (item) => item.email === email || item.eventId === eventId,
        );

        return lead || null;
    }
}

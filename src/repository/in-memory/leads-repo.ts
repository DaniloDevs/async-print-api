import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { ILeadRepository, Lead, LeadCreateInput } from "../lead";

dayjs.extend(utc);
export class LeadInMemoryRepository implements ILeadRepository {
    public items: Lead[] = [];

    async create(data: LeadCreateInput): Promise<Lead> {
        const leads: Lead = {
            id: crypto.randomUUID(),
            name: data.name,
            phone: data.phone,
            email: data.email,
            isStudent: data.isStudent,
            intentionNextYear: data.intentionNextYear,
            technical: data.technical,
            segment: data.segment,
            createdAt: dayjs().utc().toDate(),
            eventId: data.eventId,
            origin: data.origin,
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

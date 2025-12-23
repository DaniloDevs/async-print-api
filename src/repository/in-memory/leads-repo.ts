import dayjs from "dayjs";
import type { ILeadsrepository, Leads, LeadsCreateInput } from "../leads";

export class LeadsInMemomryRepository implements ILeadsrepository {
    public items: Leads[] = [];

    async create(data: LeadsCreateInput): Promise<Leads> {
        const leads: Leads = {
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
    ): Promise<Leads | null> {
        const leads = this.items.find(
            (item) => item.email === email || item.eventId === eventId,
        );

        return leads || null;
    }

    async findManyByEventId(eventId: string): Promise<Leads[]> {
        const leads = this.items.filter((item) => item.eventId === eventId);

        return leads;
    }
}

import type { IEventRepository } from "../repository/event";
import type { ILeadRepository } from "../repository/lead";
import { ResourceNotFoundError } from "./_errors/resource-not-found-error";

interface RequestDate {
    slug: string;
}
interface ResponseDate {
    leads: {
        eventId: string;
        id: string;
        name: string;
        email: string;
        intendsToStudyNextYear: boolean;
        segment: string;
    }[];
}

export class ListEventLeadsService {
    constructor(
        private eventRepository: IEventRepository,
        private leadsRepository: ILeadRepository,
    ) {}

    async execute({ slug }: RequestDate): Promise<ResponseDate> {
        const event = await this.eventRepository.findBySlug(slug);

        if (!event) {
            throw new ResourceNotFoundError({
                resourceType: "Event",
                resource: slug,
            });
        }

        const leads = await this.leadsRepository.findManyByEventId(event.id);

        return {
            leads: leads.map((lead) => ({
                eventId: lead.eventId,
                id: lead.id,
                name: lead.name,
                email: lead.email,
                intendsToStudyNextYear: lead.intendsToStudyNextYear,
                segment: lead.segment,
            })),
        };
    }
}

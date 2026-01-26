import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import type { IEventsRepository } from "../repository/events";
import type { ILeadsrepository } from "../repository/leads";

interface RequestDate {
    slug: string
}
interface ResponseDate {
    leads: {
        eventId: string
        id: string
        name: string
        email: string
        intendsToStudyNextYear: boolean
        segmentInterest: string
    }[] 
}

export class ListLeadsByEventSlug {
    constructor(
        private eventRepository: IEventsRepository,
        private leadsRepository: ILeadsrepository,
    ) { }

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
                segmentInterest: lead.segmentInterest,
            }))
        }
    }
}

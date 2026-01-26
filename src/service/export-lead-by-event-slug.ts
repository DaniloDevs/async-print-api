import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import type { IEventsRepository } from "../repository/events";
import type { ILeadsrepository, Leads } from "../repository/leads";

interface RequestDate {
    slug: string
}
interface ResponseDate {
    eventId: string
    eventSlug: string
    eventTitle: string
    leads: Leads[],
}

export class ExportLeadByEventSlugService {
    constructor(
        private readonly eventRepository: IEventsRepository,
        private readonly leadRepository: ILeadsrepository,
    ) { }

    async execute({ slug }: RequestDate): Promise<ResponseDate> {
        const event = await this.eventRepository.findBySlug(slug);

        if (!event) {
            throw new ResourceNotFoundError({
                resourceType: "Event",
                resource: slug,
            });
        }

        const leads = await this.leadRepository.findManyByEventId(event.id);

        return {
            eventId: event.id,
            eventSlug: event.slug,
            eventTitle: event.title,
            leads
        };
    }
}

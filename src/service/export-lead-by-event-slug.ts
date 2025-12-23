import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import type { IEventsRepository } from "../repository/events";
import type { ILeadsrepository } from "../repository/leads";

export class ExportLeadByEventSlugService {
    constructor(
        private readonly eventRepository: IEventsRepository,
        private readonly leadRepository: ILeadsrepository,
    ) {}

    async execute(eventSlug: string) {
        const event = await this.eventRepository.findBySlug(eventSlug);

        if (!event) {
            throw new ResourceNotFoundError({
                resourceType: "Event",
                resource: eventSlug,
            });
        }

        const leads = await this.leadRepository.findManyByEventId(event.id);

        return {
            eventId: event.id,
            eventSlug: event.slug,
            eventTitle: event.title,
            leads,
        };
    }
}

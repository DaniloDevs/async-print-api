import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import type { IEventRepository } from "../repository/event";
import type { ILeadrepository } from "../repository/lead";

export class ExportLeadBySlug {
    constructor(
        private readonly eventRepository: IEventRepository,
        private readonly leadRepository: ILeadrepository,
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

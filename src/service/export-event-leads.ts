import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import type { IEventRepository } from "../repository/event";
import type { ILeadRepository, Lead } from "../repository/lead";

interface RequestDate {
    slug: string;
}
interface ResponseDate {
    eventId: string;
    eventSlug: string;
    eventTitle: string;
    leads: Lead[];
}

export class ExportEventLeadsService {
    constructor(
        private readonly eventRepository: IEventRepository,
        private readonly leadRepository: ILeadRepository,
    ) {}

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
            leads,
        };
    }
}

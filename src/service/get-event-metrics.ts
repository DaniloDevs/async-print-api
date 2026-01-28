import dayjs from "dayjs";
import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import type { IEventRepository } from "../repository/event";
import type { ILeadRepository } from "../repository/lead";

interface RequestDate {
    eventId: string;
}
interface ResponseDate {
    currentLeads: number;
    totalLeads: number;
    eventStatus: string;
}

export class GetEventMetricsService {
    constructor(
        private eventRepository: IEventRepository,
        private leadsRepository: ILeadRepository,
    ) {}

    async execute({ eventId }: RequestDate): Promise<ResponseDate> {
        const event = await this.eventRepository.findById(eventId);

        if (!event) {
            throw new ResourceNotFoundError({
                resourceType: "Event",
                resource: eventId,
            });
        }

        const leads = await this.leadsRepository.findManyByEventId(eventId);
        const currentLeads = leads.filter((item) => {
            const lastaHour = dayjs().subtract(1, "h");

            return dayjs(item.createdAt).isAfter(lastaHour);
        });

        return {
            eventStatus: event.status,
            currentLeads: currentLeads.length,
            totalLeads: leads.length,
        };
    }
}

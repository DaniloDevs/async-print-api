import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import type { IEventRepository } from "../repository/event";
import type { ILeadRepository } from "../repository/lead";

dayjs.extend(utc);

interface RequestDate {
    eventId: string;
}
interface ResponseDate {
    leads: {
        hour: string;
        total: number;
    }[];
}

export class LeadsByPeriodService {
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

        const startEvent = dayjs.utc(event.startAt);
        const endsEvent = dayjs.utc(event.endsAt);

        const leads = await this.leadsRepository.findManyByEventId(eventId);

        //Começo
        const buckets = new Map<string, number>();

        let cursor = startEvent.startOf("hour");

        while (cursor.isBefore(endsEvent)) {
            buckets.set(cursor.toISOString(), 0);
            cursor = cursor.add(1, "hour");
        }

        for (const lead of leads) {
            const createdAt = dayjs.utc(lead.createdAt);

            if (
                !createdAt.isValid() ||
                createdAt.isBefore(startEvent) ||
                !createdAt.isBefore(endsEvent)
            ) {
                continue;
            }

            const hour = createdAt.startOf("hour").toISOString();
            buckets.set(hour, (buckets.get(hour) ?? 0) + 1);
        }

        // 3. saída ordenada e explícita
        return {
            leads: Array.from(buckets.entries()).map(([hour, total]) => ({
                hour,
                total,
            })),
        };
    }
}

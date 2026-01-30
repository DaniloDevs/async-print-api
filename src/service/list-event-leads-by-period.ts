import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import type { IEventRepository } from "../repository/event";
import type { ILeadRepository, Lead } from "../repository/lead";

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

export class ListEventLeadsByPeriodService {
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

        const leadsByPeriod = this.organizeLeadsByPeriod({
            startEvent,
            endsEvent,
            leads,
        });

        return {
            leads: leadsByPeriod,
        };
    }

    organizeLeadsByPeriod({
        startEvent,
        endsEvent,
        leads,
    }: {
        startEvent: Dayjs;
        endsEvent: Dayjs;
        leads: Lead[];
    }) {
        const start = startEvent.utc().startOf("hour");
        const end = endsEvent.utc();

        const buckets = new Map<number, number>();

        for (
            let cursor = start.clone();
            cursor.isBefore(end);
            cursor = cursor.add(1, "hour")
        ) {
            buckets.set(cursor.valueOf(), 0);
        }

        for (const lead of leads) {
            const createdAt = dayjs.utc(lead.createdAt);
            if (!createdAt.isValid()) continue;

            if (createdAt.isBefore(start) || !createdAt.isBefore(end)) continue;

            const key = createdAt.startOf("hour").valueOf();
            buckets.set(key, (buckets.get(key) ?? 0) + 1);
        }

        return [...buckets.entries()].map(([timestamp, total]) => ({
            hour: dayjs.utc(timestamp).toISOString(),
            total,
        }));
    }
}

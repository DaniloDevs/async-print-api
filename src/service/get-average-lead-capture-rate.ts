import dayjs, { Dayjs } from "dayjs";
import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import type { IEventRepository } from "../repository/event";
import type { ILeadRepository, Lead } from "../repository/lead";

interface RequestDate {
    eventId: string;
}
interface ResponseDate {
    average: number;
    message: string
}

export class GetAvarageLeadCaptureRate {
    constructor(
        private eventRepository: IEventRepository,
        private leadsRepository: ILeadRepository,
    ) { }

    async execute({ eventId }: RequestDate): Promise<ResponseDate> {
        const event = await this.eventRepository.findById(eventId);

        if (!event) {
            throw new ResourceNotFoundError({
                resourceType: "Event",
                resource: eventId,
            });
        }

        const currentDate = dayjs();
        const leads = await this.leadsRepository.findManyByEventId(eventId);

        const leadsByPeriod = this.organizeLeadsByPeriod({
            startEvent: dayjs(event.startAt),
            endsEvent: currentDate,
            leads,
        });

        const average = this.calculateAverageTotals(leadsByPeriod)
       
        // alterador de mensagem com mmbase no average
        return {
            average,
            message: `Good performance! Average of ${average.toFixed(2)}.`
        };
    }


    calculateAverageTotals(data: Array<{ hour: string; total: number }>): number {
        if (data.length === 0) {
            return 0;
        }

        const totalLead = data.reduce((acc, item) => acc + item.total, 0);
        const average = totalLead / data.length;

        return average;
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

        return Array.from(buckets.entries()).map(([hour, total]) => ({
            hour,
            total,
        }))
    }
}

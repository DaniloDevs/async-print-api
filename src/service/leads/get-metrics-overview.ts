import dayjs, { type Dayjs } from "dayjs";
import type { IEventRepository } from "../../repository/event";
import type { ILeadRepository, Lead } from "../../repository/lead";
import { ResourceNotFoundError } from "../@errors/resource-not-found-error";

interface RequestDate {
    slug: string;
}

interface ResponseDate {
    totalLeads: number;
    currentLeads: number;
    catchPercentage: number;
    averageTotals: number;
}

export class GetMetricsOverview {
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

        const leadsByPeriod = this.organizeLeadsByPeriod({
            startEvent: dayjs(event.startAt).utc(),
            endsEvent: dayjs(event.endsAt).utc(),
            leads,
        });

        return {
            totalLeads: leads.length,
            averageTotals: this.calculateAverageTotals(leadsByPeriod),
            currentLeads: leadsByPeriod[leadsByPeriod.length - 1].total,
            catchPercentage: (leads.length / leadsByPeriod.length) * 100,
        };
    }

    calculateAverageTotals(
        data: Array<{ hour: string; total: number }>,
    ): number {
        if (!data.length) {
            return 0;
        }

        const totalLeads = data.reduce((acc, item) => acc + item.total, 0);

        const activeHours = data.filter((item) => item.total > 0).length;

        if (activeHours === 0) {
            return 0;
        }

        const average = totalLeads / activeHours;

        return Math.round(average);
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

import dayjs, { type Dayjs } from "dayjs";
import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import type { IEventRepository } from "../repository/event";
import type { ILeadRepository, Lead } from "../repository/lead";

interface RequestDate {
    eventId: string;
}
interface ResponseDate {
    average: number,
    message: string,
    status: string,
    trend: string
}

export class GetLeadCaptureMetricsService {
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
        
        let currentDate: Dayjs

        if(event.status === "finished") {
            currentDate = dayjs(event.endsAt).utc();
        }
        
        currentDate = dayjs().utc();

        const leads = await this.leadsRepository.findManyByEventId(eventId);
        
        const leadsByPeriod = this.organizeLeadsByPeriod({
            startEvent: dayjs(event.startAt).utc(),
            endsEvent: currentDate,
            leads,
        });
        
        const average = this.calculateAverageTotals(leadsByPeriod)
        
        const { rate, message, status, trend } = this.performanceEvaluator(average.toFixed(2))

        return {
            average: rate,
            message,
            status,
            trend
        };
    }


    performanceEvaluator(average: string) {
        let status: "poor" | "average" | "strong";
        let trend: "down" | "stable" | "up";
        let message: string;

        const rate = Number(average)

        if (rate < 10) {
            status = "poor";
            trend = "down";
            message = "Low lead capture rate. Immediate optimization required.";
        }
        else if (rate < 25) {
            status = "average";
            trend = "stable";
            message = "Moderate performance. There is room for improvement.";
        }
        else {
            status = "strong";
            trend = "up";
            message = "High lead capture rate. Strong event performance.";
        }

        return {
            status,
            trend,
            message,
            rate
        };
    }

    calculateAverageTotals(
        data: Array<{ hour: string; total: number }>
      ): number {
        if (!data.length) {
          return 0;
        }
      
        const totalLeads = data.reduce(
          (acc, item) => acc + item.total,
          0
        );
      
        const activeHours = data.filter(item => item.total > 0).length;
      
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

import type { IEventRepository } from "../repository/event";
import type { ILeadRepository, Lead } from "../repository/lead";
import { ResourceNotFoundError } from "./_errors/resource-not-found-error";

interface RequestDate {
    eventId: string;
}
interface ResponseDate {
    origin: {
        origin: string;
        total: number;
    }[];
}

export class GetLeadMetricsByorigin {
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

        const metrics = this.calculateMetricsByorigin(leads);

        return {
            origin: metrics
                .map((metric) => ({
                    origin: metric.origin,
                    total: metric.totalLeads,
                }))
                .sort((a, b) => b.total - a.total),
        };
    }

    calculateMetricsByorigin(leads: Lead[]) {
        const groups: Record<
            string,
            {
                origin: string;
                totalLeads: number;
            }
        > = {};

        for (const lead of leads) {
            const origin = lead.origin;

            if (!groups[origin]) {
                groups[origin] = {
                    origin,
                    totalLeads: 0,
                };
            }

            groups[origin].totalLeads++;
        }

        return Object.values(groups);
    }
}

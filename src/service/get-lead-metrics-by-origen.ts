import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import type { IEventRepository } from "../repository/event";
import type { ILeadRepository, Lead } from "../repository/lead";

interface RequestDate {
    eventId: string;
}
interface ResponseDate {
    origen: {
        origen: string;
        total: number;
    }[];
}

export class GetLeadMetricsByOrigen {
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

        const metrics = this.calculateMetricsByOrigen(leads);

        return {
            origen: metrics
                .map((metric) => ({
                    origen: metric.origen,
                    total: metric.totalLeads,
                }))
                .sort((a, b) => b.total - a.total),
        };
    }

    calculateMetricsByOrigen(leads: Lead[]) {
        const groups: Record<
            string,
            {
                origen: string;
                totalLeads: number;
            }
        > = {};

        for (const lead of leads) {
            const origen = lead.origen;

            if (!groups[origen]) {
                groups[origen] = {
                    origen,
                    totalLeads: 0,
                };
            }

            groups[origen].totalLeads++;
        }

        return Object.values(groups);
    }
}

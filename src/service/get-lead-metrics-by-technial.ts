import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import { IEventRepository } from "../repository/event";
import { ILeadRepository, Lead } from "../repository/lead";

interface RequestDate {
    eventId: string;
}
interface ResponseDate {
    technical: {
        technical: string,
        total: number
        interestNewyear: number
    }[]
}

export class GetLeadMetricsByTechnical {
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

        const leads = await this.leadsRepository.findManyByEventId(eventId);

        const metrics = this.calculateMetricsByTechnical(leads)

        return {
            technical: metrics.map(metric => ({
                technical: metric.technical,
                total: metric.totalLeads,
                interestNewyear: metric.leadsWithIntentNextYear,
            })).sort((a, b) => b.total - a.total)
        }

    }

    calculateMetricsByTechnical(leads: Lead[]) {
        const groups: Record<string, {
            technical: string;
            totalLeads: number;
            leadsWithIntentNextYear: number;
        }> = {};

        for (const lead of leads) {
            const technical = lead.technicalInterest;

            if (!groups[technical]) {
                groups[technical] = {
                    technical,
                    totalLeads: 0,
                    leadsWithIntentNextYear: 0,
                };
            }

            groups[technical].totalLeads++;

            if (lead.intendsToStudyNextYear) {
                groups[technical].leadsWithIntentNextYear++;
            }
        }

        return Object.values(groups)
    }
}

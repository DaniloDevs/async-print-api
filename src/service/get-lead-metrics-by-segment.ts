import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import { IEventRepository } from "../repository/event";
import { ILeadRepository, Lead, SegmentInterest } from "../repository/lead";

interface RequestDate {
    eventId: string;
}
interface ResponseDate {
    segments: {
        segment: string,
        total: number
        interestNewyear: number
    }[]
}

export class GetLeadMetricsBySegment {
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

        const metrics = this.calculateMetricsBySegment(leads)

        return {
            segments: metrics.map(metric => ({
                segment: metric.segment,
                total: metric.totalLeads,
                interestNewyear: metric.leadsWithIntentNextYear,
            })).sort((a, b) => b.total - a.total)
        }

    }

    calculateMetricsBySegment(leads: Lead[]) {
        const groups: Record<string, {
            segment: string;
            totalLeads: number;
            leadsWithIntentNextYear: number;
        }> = {};

        for (const lead of leads) {
            const segment = lead.segmentInterest ?? "NONE";

            if (!groups[segment]) {
                groups[segment] = {
                    segment,
                    totalLeads: 0,
                    leadsWithIntentNextYear: 0,
                };
            }

            groups[segment].totalLeads++;

            if (lead.intendsToStudyNextYear) {
                groups[segment].leadsWithIntentNextYear++;
            }
        }

        return Object.values(groups)
    }
}

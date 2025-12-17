import dayjs from "dayjs";
import { EventAlreadyEndedError } from "../_errors/event-already-ended-error";
import { EventNotActiveError } from "../_errors/event-not-active-error";
import { EventNotStartedYetError } from "../_errors/event-not-started-yet-error";
import { LeadAlreadyRegisteredError } from "../_errors/lead-already-registered-error";
import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import type { IEventRepository } from "../repository/event";
import type { ILeadrepository, LeadCreateInput } from "../repository/lead";
import { normalizePhoneToDDNumber } from "../utils/normalize-phone-to-ddnumber";

export class CreateLeadByEventSlugService {
    constructor(
        private eventRepository: IEventRepository,
        private leadRepository: ILeadrepository,
    ) {}

    async execute(data: LeadCreateInput, eventSlug: string) {
        const event = await this.eventRepository.findBySlug(eventSlug);
        if (!event) {
            throw new ResourceNotFoundError({
                resourceType: "Event",
                resource: eventSlug,
            });
        }

        if (!event.isActivated) {
            throw new EventNotActiveError(eventSlug);
        }

        const startEventDate = dayjs(event.startAt);
        const endEventDate = event.endsAt ? dayjs(event.endsAt) : null;
        const now = dayjs();

        if (now.isBefore(startEventDate)) {
            throw new EventNotStartedYetError(event.startAt);
        }

        if (endEventDate && now.isAfter(endEventDate)) {
            throw new EventAlreadyEndedError(event.endsAt);
        }

        const existingLead = await this.leadRepository.findByEmailAndEventId(
            data.email,
            event.id,
        );

        if (existingLead) {
            throw new LeadAlreadyRegisteredError(data.email, eventSlug);
        }

        const formattedPhoneNumber = normalizePhoneToDDNumber(data.phone);

        const lead = await this.leadRepository.create({
            ...data,
            eventId: event.id,
            phone: formattedPhoneNumber,
        });

        return lead;
    }
}

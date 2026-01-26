import { InvalidEventStatusTransitionError } from "../_errors/invalid-event-status-transitions-error";
import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import { EventsStatus, IEventsRepository, type Events } from "../repository/events";
import { allowedTransitions } from "../utils/transitions-events-status";

interface RequestDate {
    eventId: string,
    newStatus: EventsStatus
}
interface ResponseDate {
    event: Events
}

export class UpdateEventStatusService {
    constructor(
        private eventsRepository: IEventsRepository,
    ) { }

    async execute({
        eventId,
        newStatus }: RequestDate
    ): Promise<ResponseDate> {
        const event = await this.eventsRepository.findById(eventId);
        if (!event) {
            throw new ResourceNotFoundError({
                resourceType: "Event",
                resource: eventId,
            });
        }


        if (!allowedTransitions[event.status].includes(newStatus)) {
            throw new InvalidEventStatusTransitionError(event.status, newStatus);
        }

        const updatedEvent = await this.eventsRepository.updateStatus(eventId, newStatus);
        if (!updatedEvent) {
            throw new ResourceNotFoundError({
                resourceType: "Event",
                resource: eventId,
            });
        }

        return {
            event: updatedEvent
        };

    }
}
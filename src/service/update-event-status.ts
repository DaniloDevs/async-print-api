import { InvalidEventStatusTransitionError } from "../_errors/invalid-event-status-transitions-error";
import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import type { Event, EventStatus, IEventRepository } from "../repository/event";

interface RequestDate {
  eventId: string;
  newStatus: EventStatus;
}
interface ResponseDate {
  event: Event;
}

export class UpdateEventStatusService {
  constructor(private eventsRepository: IEventRepository) {}

  async execute({ eventId, newStatus }: RequestDate): Promise<ResponseDate> {
    const event = await this.eventsRepository.findById(eventId);
    if (!event) {
      throw new ResourceNotFoundError({
        resourceType: "Event",
        resource: eventId,
      });
    }

    if (!this.canTransition(event.status, newStatus)) {
      throw new InvalidEventStatusTransitionError(event.status, newStatus);
    }

    const updatedEvent = await this.eventsRepository.updateStatus(
      eventId,
      newStatus,
    );
    if (!updatedEvent) {
      throw new ResourceNotFoundError({
        resourceType: "Event",
        resource: eventId,
      });
    }

    return {
      event: updatedEvent,
    };
  }

  canTransition(from: EventStatus, to: EventStatus): boolean {
    const ALLOWED_EVENT_STATUS_TRANSITIONS: Record<EventStatus, EventStatus[]> =
      {
        draft: ["active", "canceled"],
        active: ["finished", "canceled", "inactive"],
        inactive: ["active", "finished", "canceled"],
        finished: ["canceled"],
        canceled: [],
      };

    return ALLOWED_EVENT_STATUS_TRANSITIONS[from].includes(to);
  }
}

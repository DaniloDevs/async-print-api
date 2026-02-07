import dayjs from "dayjs";
import { EventAlreadyExistsError } from "../_errors/event-already-exist-error";
import { EventEndBeforeStartError } from "../_errors/event-end-before-start-error";
import { EventStartDateInPastError } from "../_errors/event-start-date-in-past-error";
import { EventDurationTooShortError } from "../_errors/event-duration-too-short-error";
import type {
  Event,
  EventCreateInput,
  IEventRepository,
} from "../repository/event";

interface RequestDate {
  data: EventCreateInput;
}
interface ResponseDate {
  event: Event;
}

export class CreateEventService {
  constructor(private repository: IEventRepository) {}

  async execute({ data }: RequestDate): Promise<ResponseDate> {
    const slug = this.generateSlug(data.title);

    const existEvent = await this.repository.findBySlug(slug);
    if (existEvent) {
      throw new EventAlreadyExistsError(slug);
    }

    this.durationIsValid(data.startAt, data.endsAt);

    const event = await this.repository.create({
      ...data,
      startAt: dayjs(data.startAt).toDate(),
      endsAt: dayjs(data.endsAt).toDate(),
      status: "draft",
    });

    return { event };
  }

  durationIsValid(start: Date, end: Date) {
    const startAt = dayjs(start).toDate();
    const endsAt = dayjs(end).toDate();

    // EventStartDateInPastError: thrown when the event start date is before the current time.
    if (dayjs().isAfter(startAt)) {
      throw new EventStartDateInPastError(startAt);
    }

    // EventEndBeforeStartError: thrown when the event end date is not after the start date.
    if (!dayjs(endsAt).isAfter(startAt)) {
      throw new EventEndBeforeStartError(startAt, endsAt);
    }

    
    const MIN_DURATION_MINUTES = 60;
    // EventDurationTooShortError: thrown when the event duration is shorter than the minimum allowed minutes.
    const durationMinutes = dayjs(endsAt).diff(dayjs(startAt), "minute");
    if (durationMinutes < MIN_DURATION_MINUTES) {
      throw new EventDurationTooShortError(
        MIN_DURATION_MINUTES,
        durationMinutes,
      );
    }
  }

  generateSlug(str: string) {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}

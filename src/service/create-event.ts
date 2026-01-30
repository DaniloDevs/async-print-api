import dayjs from "dayjs";
import { EventAlreadyExistsError } from "../_errors/event-already-exist-error";
import { EventEndBeforeStartError } from "../_errors/event-end-before-start-error";
import { EventStartDateInPastError } from "../_errors/event-start-date-in-past-error";
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

        const startAt = dayjs(data.startAt).toDate();
        const endsAt = dayjs(data.endsAt).toDate();

        if (dayjs().isAfter(startAt)) {
            throw new EventStartDateInPastError(startAt);
        }

        if (!dayjs(endsAt).isAfter(startAt)) {
            throw new EventEndBeforeStartError(startAt, endsAt);
        }

        const event = await this.repository.create({
            ...data,
            startAt,
            endsAt,
            status: "draft",
        });

        return { event };
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

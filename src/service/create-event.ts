import dayjs from "dayjs";
import { EventAlreadyExistsError } from "../_errors/event-already-exist-error";
import { EventEndBeforeStartError } from "../_errors/event-end-before-start-error";
import { EventStartDateInPastError } from "../_errors/event-start-date-in-past-error";
import type {
    EventsCreateInput,
    IEventsRepository,
} from "../repository/events";
import { createSlug } from "../utils/create-slug";

export class CreateEventService {
    constructor(private repository: IEventsRepository) {}

    async execute(data: EventsCreateInput) {
        const slug = createSlug(data.title);

        // Verifica se evento já existe
        const existEvent = await this.repository.findBySlug(slug);
        if (existEvent) {
            throw new EventAlreadyExistsError(slug);
        }

        const startAt = dayjs(data.startAt).toDate();
        const endsAt = dayjs(data.endsAt).toDate();
        const now = dayjs();

        // Valida data de início não está no passado
        if (now.isAfter(startAt)) {
            throw new EventStartDateInPastError(startAt);
        }

        // Valida data de término não é antes ou igual ao início
        if (dayjs(endsAt).isBefore(startAt)) {
            throw new EventEndBeforeStartError(startAt, endsAt);
        }

        const event = await this.repository.create({
            ...data,
            startAt,
            endsAt,
        });

        return { event };
    }
}

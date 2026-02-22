import dayjs from "dayjs";
import type { IEventRepository } from "../../repository/event";

interface ResponseDate {
    events: {
        startAt: string;
        endsAt: string;
        id: string;
        title: string;
        slug: string;
        bannerKey: string | null;
        status: "ACTIVE" | "INACTIVE" | "DRAFT" | "FINISHED" | "CANCELED";
    }[]
}

export class ListEventsService {
    constructor(private eventRepository: IEventRepository) { }

    async execute(): Promise<ResponseDate> {
        const events = await this.eventRepository.findMany();

        const formattedEvents = events.map((event) => ({
            ...event,
            bannerKey: event.bannerKey,
            startAt: dayjs(event.startAt).format("DD-MM-YY HH:mm:ss"),
            endsAt: dayjs(event.endsAt).format("DD-MM-YY HH:mm:ss"),
        }));

        return {
            events: formattedEvents,
        };
    }
}

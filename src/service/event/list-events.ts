import type { IEventRepository } from "../../repository/event";

interface ResponseDate {
    events: {
        startAt: Date;
        endsAt: Date;
        id: string;
        title: string;
        slug: string;
        bannerKey: string | null;
        status: "ACTIVE" | "INACTIVE" | "DRAFT" | "FINISHED" | "CANCELED";
    }[];
}

export class ListEventsService {
    constructor(private eventRepository: IEventRepository) {}

    async execute(): Promise<ResponseDate> {
        const events = await this.eventRepository.findMany();

        const formattedEvents = events.map((event) => ({
            ...event,
            bannerKey: event.bannerKey,
        }));

        return {
            events: formattedEvents,
        };
    }
}

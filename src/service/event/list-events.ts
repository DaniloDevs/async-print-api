import type { IEventRepository, Event } from "../../repository/event";

interface ResponseDate {
    events: Event[];
}

export class ListEventsService {
    constructor(private eventRepository: IEventRepository) { }

    async execute(): Promise<ResponseDate> {
        const events = await this.eventRepository.findMany();

        return {
            events,
        };
    }
}

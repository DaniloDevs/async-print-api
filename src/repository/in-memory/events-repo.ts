import dayjs from "dayjs";
import { createSlug } from "../../utils/create-slug";
import type { Events, EventsCreateInput, IEventsRepository } from "../events";

export class EventsInMemomryRepository implements IEventsRepository {
    public items: Events[] = [];

    async create(data: EventsCreateInput): Promise<Events> {
        const events: Events = {
            id: crypto.randomUUID(),
            title: data.title,
            slug: createSlug(data.title),
            startAt: dayjs(data.startAt).toDate(),
            endsAt: dayjs(data.endsAt).toDate(),
            bannerKey: data.bannerKey,
            isActivated: data.isActivated,
        };

        this.items.push(events);

        return events;
    }

    async findBySlug(slug: string): Promise<Events | null> {
        const events = this.items.find((item) => item.slug === slug);
        return events || null;
    }

    async findById(id: string): Promise<Events | null> {
        const events = this.items.find((item) => item.id === id);
        return events || null;
    }

    async updateBanner(id: string, banner: string): Promise<Events | null> {
        const events = this.items.find((item) => item.id === id);

        if (!events) return null;

        events.bannerKey = banner;
        return events;
    }
}

import dayjs from "dayjs";
import { createSlug } from "../../utils/create-slug";
import type {
    Event,
    EventCreateInput,
    EventStatus,
    IEventRepository,
} from "../event";

export class EventInMemoryRepository implements IEventRepository {
    public items: Event[] = [];

    async create(data: EventCreateInput): Promise<Event> {
        const event: Event = {
            id: crypto.randomUUID(),
            title: data.title,
            slug: createSlug(data.title),
            startAt: dayjs(data.startAt).toDate(),
            endsAt: dayjs(data.endsAt).toDate(),
            bannerKey: data.bannerKey,
            status: data.status,
        };

        this.items.push(event);

        return event;
    }

    async findBySlug(slug: string): Promise<Event | null> {
        const event = this.items.find((item) => item.slug === slug);
        return event || null;
    }

    async findById(id: string): Promise<Event | null> {
        const event = this.items.find((item) => item.id === id);
        return event || null;
    }

    async updateBanner(id: string, banner: string): Promise<Event | null> {
        const event = this.items.find((item) => item.id === id);

        if (!event) return null;

        event.bannerKey = banner;
        return event;
    }

    async updateStatus(id: string, status: EventStatus): Promise<Event | null> {
        const event = this.items.find((item) => item.id === id);

        if (!event) return null;

        event.status = status;
        return event;
    }

    async forceStatus(id: string, status: EventStatus) {
        const event = this.items.find((e) => e.id === id);
        if (!event) throw new Error("Event not found");

        event.status = status;
    }
}

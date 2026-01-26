import z from "zod";

const eventStatus = z.enum([
    "active",
    "inactive",
    "draft",
    "finished",
    "canceled",
]);

const event = z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    bannerKey: z.string().nullable(),
    startAt: z.date(),
    endsAt: z.date(),
    status: eventStatus,
});

const EventCreateInput = event.omit({
    id: true,
    slug: true,
});

export type Event = z.infer<typeof event>;
export type EventCreateInput = z.infer<typeof EventCreateInput>;
export type EventStatus = z.infer<typeof eventStatus>;

export interface IEventRepository {
    create(data: EventCreateInput): Promise<Event>;
    updateBanner(id: string, banner: string): Promise<Event | null>;
    findBySlug(slug: string): Promise<Event | null>;
    findById(id: string): Promise<Event | null>;
    updateStatus(id: string, status: EventStatus): Promise<Event | null>;
    forceStatus(id: string, status: EventStatus): Promise<void>;
}

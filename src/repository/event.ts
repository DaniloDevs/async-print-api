import z from "zod";

const event = z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    banner: z.string().nullable(),
    startAt: z.date(),
    endsAt: z.date(),
    isActivated: z.boolean(),
});

const EventCreateInput = event.omit({
    id: true,
    slug: true,
});

export type Event = z.infer<typeof event>;
export type EventCreateInput = z.infer<typeof EventCreateInput>;

export interface IEventRepository {
    create(data: EventCreateInput): Promise<Event>;
    updateBanner(id: string, banner: string): Promise<Event | null>;
    findBySlug(slug: string): Promise<Event | null>;
    findById(id: string): Promise<Event | null>;
}

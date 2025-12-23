import z from "zod";

const events = z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    bannerKey: z.string().nullable(),
    startAt: z.date(),
    endsAt: z.date(),
    isActivated: z.boolean(),
});

const EventsCreateInput = events.omit({
    id: true,
    slug: true,
});

export type Events = z.infer<typeof events>;
export type EventsCreateInput = z.infer<typeof EventsCreateInput>;

export interface IEventsRepository {
    create(data: EventsCreateInput): Promise<Events>;
    updateBanner(id: string, banner: string): Promise<Events | null>;
    findBySlug(slug: string): Promise<Events | null>;
    findById(id: string): Promise<Events | null>;
}

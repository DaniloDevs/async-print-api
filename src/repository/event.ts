import z from "zod";

export const eventStatusSchema = z.enum([
    "ACTIVE",
    "INACTIVE",
    "DRAFT",
    "FINISHED",
    "CANCELED",
]);

export const eventSchema = z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    bannerKey: z.string().nullable(),
    startAt: z.date(),
    endsAt: z.date(),
    status: eventStatusSchema,
});

export const eventCreateInputSchema = eventSchema.omit({
    id: true,
    slug: true,
});

export type Event = z.infer<typeof eventSchema>;
export type EventCreateInput = z.infer<typeof eventCreateInputSchema>;
export type EventStatus = z.infer<typeof eventStatusSchema>;

export interface IEventRepository {
    create(data: EventCreateInput): Promise<Event>;
    updateBanner(id: string, banner: string): Promise<Event | null>;
    findBySlug(slug: string): Promise<Event | null>;
    findMany(): Promise<Event[]>;
    findById(id: string): Promise<Event | null>;
    updateStatus(id: string, status: EventStatus): Promise<Event | null>;
    forceStatus(id: string, status: EventStatus): Promise<void>;
}

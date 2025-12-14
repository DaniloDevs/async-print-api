import z from "zod"

const event = z.object({
   id: z.string(),
   title: z.string(),
   slug: z.string(),
   isActivated: z.boolean(),
   banner: z.string().nullable(),
   startAt: z.date(),
   endsAt: z.date(),
})


const eventCreateInput = event.omit({
   id: true,
   slug: true
})

export type Event = z.infer<typeof event>
export type EventCreateInput = z.infer<typeof eventCreateInput>

export interface IEventRepository {
   create(data: EventCreateInput): Promise<Event>
   findById(id: string): Promise<Event | null>
   findBySlug(slug: string): Promise<Event | null>
}
import { createSlug } from "../../utils/create-slug";
import type { Event, EventCreateInput, IEventRepository } from "../event-repository";



export class EventInMemory implements IEventRepository {
   public item: Event[] = []

   async create(data: EventCreateInput): Promise<Event> {
      const event: Event = {
         id: crypto.randomUUID(),
         title: data.title,
         slug: createSlug(data.title),
         banner: data.banner ?? null,
         isActivated: data.isActivated,
         startAt: data.startAt,
         endsAt: data.endsAt,
      }

      this.item.push(event)

      return event
   }


   async findById(id: string): Promise<Event | null> {
      const event = this.item.find(event => event.id === id)

      return event ?? null
   }

   async findBySlug(slug: string): Promise<Event | null> {
      const event = this.item.find(event => event.slug === slug)

      return event ?? null
   }
}
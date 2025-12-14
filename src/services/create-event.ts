
import dayjs from 'dayjs';
import { createSlug } from '../utils/create-slug';
import { IEventRepository, type EventCreateInput } from '../repository/event-repository';


export class CreateEvent {
   constructor(private repository: IEventRepository) { }

   async excecute(data: EventCreateInput) {
      const existEvent = await this.repository.findBySlug(createSlug(data.title))

      if (existEvent) throw new Error("Already exist event");

      const event = await this.repository.create({
         ...data,
         startAt: dayjs(data.startAt).toDate(),
         endsAt: dayjs(data.endsAt).toDate(),
      })

      return { event }
   }
}
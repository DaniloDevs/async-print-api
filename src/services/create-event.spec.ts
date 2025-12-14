import { beforeAll, describe, expect, it } from "vitest";
import { EventInMemory } from "../repository/in-memory/event";
import { CreateEvent } from "./create-event";
import type { EventCreateInput, IEventRepository } from "../repository/event-repository";
import dayjs from "dayjs";
import { createSlug } from "../utils/create-slug";


describe('Create Event - Service', () => {
   let eventRepository: IEventRepository
   let sut: CreateEvent

   beforeAll(() => {
      eventRepository = new EventInMemory()
      sut = new CreateEvent(eventRepository)
   })


   it('should be able create a new event', async () => {
      const eventData: EventCreateInput = {
         title: "Evento Teste Loide Maxima",
         isActivated: true,
         banner: null,
         startAt: dayjs().add(7, 'day').toDate(),
         endsAt: dayjs().add(7, 'day').add(10, "hour").toDate(),
      }

      const { event } = await sut.excecute(eventData)

      expect(event.id).toEqual(expect.any(String))
      expect(event.slug).toBe(createSlug(event.title))
   })
})
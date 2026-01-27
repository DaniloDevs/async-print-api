import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type { Event } from './../../repository/event';
import type { IEventRepository } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { LeadInMemoryRepository } from "../../repository/in-memory/leads-repo";
import type { ILeadRepository } from "../../repository/lead";
import { GetAverageLeadCaptureRateService } from "../get-average-lead-capture-rate";

dayjs.extend(utc);

describe('Get Average lead capture rate - Service', () => {
   let sut: GetAverageLeadCaptureRateService
   let eventRepository: IEventRepository
   let leadRepository: ILeadRepository
   let event: Event

   beforeEach(async () => {
      vi.useFakeTimers();
      vi.setSystemTime(dayjs("2021-01-27T08:00:00Z").utc().utc().toDate());

      eventRepository = new EventInMemoryRepository()
      leadRepository = new LeadInMemoryRepository()
      sut = new GetAverageLeadCaptureRateService(eventRepository, leadRepository)

      event = await eventRepository.create({
         title: "Event Test",
         bannerKey: null,
         status: "active",
         startAt: dayjs().utc().toDate(),
         endsAt: dayjs().add(5, 'hour').utc().toDate(),
      });
   })

   afterEach(() => {
      vi.useRealTimers()
   })


   describe("Successful cases", () => {
      it("should be possible to calculate the average number of leads per hour for the event.", async () => {
       
         for (let ii = 0; ii < 2; ii++) {
            vi.setSystemTime(dayjs().add(ii,'h').utc().toDate());

            for (let i = 0; i < 5; i++) {
               await leadRepository.create({
                  name: `Lead ${i}`,
                  phone: `217000000${i}`,
                  email: `leads${i}@email.com`,
                  isStudent: true,
                  intendsToStudyNextYear: true,
                  technicalInterest: "INF",
                  segmentInterest: "ANO_1_MEDIO",
                  eventId: event.id,
              });
            }
         }


         const result = await sut.execute({ eventId: event.id });

         expect(result.average).toBe(5);
         expect(result.status).toBe("poor");
         expect(result.trend).toBe("down");
      });

      it("You must correctly calculate the average after two days of the event.", async () => {
         for (let ii = 0; ii < 4; ii++) {
            vi.setSystemTime(dayjs().add(ii,'h').utc().toDate());

            for (let i = 0; i < 2; i++) {
               await leadRepository.create({
                  name: `Lead ${i}`,
                  phone: `217000000${i}`,
                  email: `leads${i}@email.com`,
                  isStudent: true,
                  intendsToStudyNextYear: true,
                  technicalInterest: "INF",
                  segmentInterest: "ANO_1_MEDIO",
                  eventId: event.id,
              });
            }
         }

         vi.setSystemTime(dayjs().add(1,'d').utc().toDate());

         const result = await sut.execute({ eventId: event.id });

         // 48 leads / 48 horas = 1
         expect(result.average).toBe(2);
         expect(result.status).toBe("poor");
      });

      it("should return low metrics when the average is less than 10.", async () => {
         for (let ii = 0; ii < 4; ii++) {
            vi.setSystemTime(dayjs().add(ii,'h').utc().toDate());

            for (let i = 0; i < Math.floor(5); i++) {
               await leadRepository.create({
                  name: `Lead ${i}`,
                  phone: `217000000${i}`,
                  email: `leads${i}@email.com`,
                  isStudent: true,
                  intendsToStudyNextYear: true,
                  technicalInterest: "INF",
                  segmentInterest: "ANO_1_MEDIO",
                  eventId: event.id,
              });
            }
         }

         const result = await sut.execute({ eventId: event.id });

         expect(result.status).toBe("poor");
         expect(result.trend).toBe("down");
      });

      it("should return stable metrics when the average is between 10 and 25.", async () => {

         for (let ii = 0; ii < 4; ii++) {
            vi.setSystemTime(dayjs().add(ii,'h').utc().toDate());

            for (let i = 0; i < Math.floor(10); i++) {
               await leadRepository.create({
                  name: `Lead ${i}`,
                  phone: `217000000${i}`,
                  email: `leads${i}@email.com`,
                  isStudent: true,
                  intendsToStudyNextYear: true,
                  technicalInterest: "INF",
                  segmentInterest: "ANO_1_MEDIO",
                  eventId: event.id,
              });
            }
         }


         const result = await sut.execute({ eventId: event.id });

         expect(result.average).toBeGreaterThanOrEqual(10);
         expect(result.status).toBe("average");
         expect(result.trend).toBe("stable");
      });

      it("should return strong metrics when the average is greater than 25.", async () => {

         for (let ii = 0; ii < 4; ii++) {
            vi.setSystemTime(dayjs().add(ii,'h').utc().toDate());

            for (let i = 0; i < Math.floor(25); i++) {
               await leadRepository.create({
                  name: `Lead ${i}`,
                  phone: `217000000${i}`,
                  email: `leads${i}@email.com`,
                  isStudent: true,
                  intendsToStudyNextYear: true,
                  technicalInterest: "INF",
                  segmentInterest: "ANO_1_MEDIO",
                  eventId: event.id,
              });
            }
         }


         const result = await sut.execute({ eventId: event.id });

         expect(result.status).toBe("strong");
         expect(result.trend).toBe("up");
      });
   });

   describe("Error cases", () => {
      it("should not allow the calculation of metrics for an event that does not exist.", async () => {
         await expect(
            sut.execute({ eventId: "invalid-event-id" })
         ).rejects.toBeInstanceOf(ResourceNotFoundError);
      });
   });
});
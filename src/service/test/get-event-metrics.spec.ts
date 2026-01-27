import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type { Event } from './../../repository/event';
import type { IEventRepository } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { LeadInMemoryRepository } from "../../repository/in-memory/leads-repo";
import type { ILeadRepository } from "../../repository/lead";
import { GetEventMetricsService } from "../get-event-metrics";

dayjs.extend(utc);

describe('Get Event Metrics (Service)', () => {
   let sut: GetEventMetricsService
   let eventRepository: IEventRepository
   let leadRepository: ILeadRepository
   let event: Event

   const NOW = dayjs('2024-01-01T12:00:00Z');

   beforeEach(async () => {
      vi.useFakeTimers();
      vi.setSystemTime(NOW.toDate());

      eventRepository = new EventInMemoryRepository()
      leadRepository = new LeadInMemoryRepository()
      sut = new GetEventMetricsService(eventRepository, leadRepository)

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
      it('deve ser possível pegar a métrica de um evento sem leads', async () => {
         // Act
         const result = await sut.execute({ eventId: event.id });

         // Assert
         expect(result).toEqual({
            eventStatus: 'active',
            currentLeads: 0,
            totalLeads: 0,
         });
      });

      it('deve contar apenas leads criados na última hora', async () => {
         // 3 leads recentes
         vi.setSystemTime(NOW.subtract(30, 'minutes').toDate());
         for (let i = 0; i < 3; i++) {
            await leadRepository.create({
               name: "Lead 1",
               phone: "21 983294521",
               email: "lead1@email.com",
               isStudent: true,
               intendsToStudyNextYear: true,
               technicalInterest: "INF",
               segmentInterest: "ANO_1_MEDIO",
               eventId: event.id,
            });
         }

         // 3 leads antigos
         vi.setSystemTime(NOW.subtract(2, 'hours').toDate());
         for (let i = 0; i < 3; i++) {
            await leadRepository.create({
               name: "Lead 1",
               phone: "21 983294521",
               email: "lead1@email.com",
               isStudent: true,
               intendsToStudyNextYear: true,
               technicalInterest: "INF",
               segmentInterest: "ANO_1_MEDIO",
               eventId: event.id,
            });
         }

         // agora atual
         vi.setSystemTime(NOW.toDate());

         const result = await sut.execute({ eventId: event.id });

         expect(result.currentLeads).toBe(3);
         expect(result.totalLeads).toBe(6);
      });

      it('considera lead com 59 minutos como recente', async () => {
         vi.setSystemTime(NOW.subtract(59, 'minutes').toDate());
         await leadRepository.create({
            name: "Lead 1",
            phone: "21 983294521",
            email: "lead1@email.com",
            isStudent: true,
            intendsToStudyNextYear: true,
            technicalInterest: "INF",
            segmentInterest: "ANO_1_MEDIO",
            eventId: event.id,
         });

         vi.setSystemTime(NOW.toDate());

         const result = await sut.execute({ eventId: event.id });

         expect(result.currentLeads).toBe(1);
      });

      it('deve retornar currentLeads como 0 quando todos os leads são antigos', async () => {
         for (let i = 0; i < 3; i++) {
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


         vi.setSystemTime(dayjs().add(3, 'h').utc().toDate());
         const result = await sut.execute({ eventId: event.id });

         // Assert
         expect(result).toEqual({
            eventStatus: 'active',
            currentLeads: 0,
            totalLeads: 3,
         });
      });

      it('não considera lead criado exatamente há 60 minutos', async () => {
         vi.setSystemTime(NOW.subtract(60, 'minutes').toDate());
         await leadRepository.create({
            name: "Lead 1",
            phone: "21 983294521",
            email: "lead1@email.com",
            isStudent: true,
            intendsToStudyNextYear: true,
            technicalInterest: "INF",
            segmentInterest: "ANO_1_MEDIO",
            eventId: event.id,
         });


         vi.setSystemTime(NOW.toDate());

         const result = await sut.execute({ eventId: event.id });

         expect(result.currentLeads).toBe(0);
      });

      it('deve retornar o status correto do evento', async () => {
         // Arrange - Criar evento com status diferente
         const inactiveEvent = await eventRepository.create({
            title: "Inactive Event",
            bannerKey: null,
            status: "inactive",
            startAt: dayjs().utc().toDate(),
            endsAt: dayjs().add(5, 'hour').utc().toDate(),
         });

         // Act
         const result = await sut.execute({ eventId: inactiveEvent.id });

         // Assert
         expect(result.eventStatus).toBe('inactive');
      });

      it('conta corretamente leads em múltiplos momentos', async () => {
         const offsets = [0, 15, 30, 45, 60, 90, 120];

         for (const minutes of offsets) {
            vi.setSystemTime(NOW.subtract(minutes, 'minutes').toDate());
            await leadRepository.create({
               name: "Lead 1",
               phone: "21 983294521",
               email: "lead1@email.com",
               isStudent: true,
               intendsToStudyNextYear: true,
               technicalInterest: "INF",
               segmentInterest: "ANO_1_MEDIO",
               eventId: event.id,
            });
         }

         vi.setSystemTime(NOW.toDate());

         const result = await sut.execute({ eventId: event.id });

         expect(result.currentLeads).toBe(4); // 0,15,30,45
         expect(result.totalLeads).toBe(7);
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
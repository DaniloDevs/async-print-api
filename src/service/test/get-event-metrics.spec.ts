import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type { Event } from "./../../repository/event";
import type { IEventRepository } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { LeadInMemoryRepository } from "../../repository/in-memory/leads-repo";
import type { ILeadRepository } from "../../repository/lead";
import { GetEventMetricsService } from "../get-event-metrics";
import { makeEvent } from "./factorey/makeEvent";
import { makeLead } from "./factorey/makeLead";

describe("Get Event Metrics (Service)", () => {
    let sut: GetEventMetricsService;
    let eventRepository: IEventRepository;
    let leadRepository: ILeadRepository;
    let event: Event;

    const NOW = dayjs("2024-01-01T12:00:00Z");

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW.toDate());

        eventRepository = new EventInMemoryRepository();
        leadRepository = new LeadInMemoryRepository();
        sut = new GetEventMetricsService(eventRepository, leadRepository);

        event = await eventRepository.create(makeEvent());
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("Successful cases", () => {
        it("should be possible to capture metrics for an event without leads.", async () => {
            const result = await sut.execute({ eventId: event.id });

            expect(result).toEqual({
                eventStatus: "active",
                currentLeads: 0,
                totalLeads: 0,
            });
        });

        it("should be possible to calculate metrics only from the last hour.", async () => {
            // 3 leads recentes
            vi.setSystemTime(NOW.subtract(30, "minutes").toDate());
            for (let i = 0; i < 3; i++) {
                await leadRepository.create(makeLead({
                    name: `Lead ${i}`,
                    phone: `21 90000000${i}`,
                    email: `lead${i}@email.com`,
                    eventId: event.id
                }))
            }

            // 3 leads antigos
            vi.setSystemTime(NOW.subtract(2, "hours").toDate());
            for (let i = 0; i < 3; i++) {
                await leadRepository.create(makeLead({
                    name: `Lead ${i}`,
                    phone: `21 90000000${i}`,
                    email: `lead${i}@email.com`,
                    eventId: event.id
                }));
            }

            // agora atual
            vi.setSystemTime(NOW.toDate());

            const result = await sut.execute({ eventId: event.id });

            expect(result.currentLeads).toBe(3);
            expect(result.totalLeads).toBe(6);
        });

        it("should be possible to calculate metrics for leads created within 59 minutes.", async () => {
            vi.setSystemTime(NOW.subtract(59, "minutes").toDate());
            await leadRepository.create(makeLead({
                name: `Lead `,
                phone: `21 90000000`,
                email: `lead@email.com`,
                eventId: event.id
            }));

            vi.setSystemTime(NOW.toDate());

            const result = await sut.execute({ eventId: event.id });

            expect(result.currentLeads).toBe(1);
        });

        it("should be possible to calculate zero metrics when there are no recent leads.", async () => {
            for (let i = 0; i < 3; i++) {
                await leadRepository.create(makeLead({
                    name: `Lead ${i}`,
                    phone: `21 90000000${i}`,
                    email: `lead${i}@email.com`,
                    eventId: event.id
                }));
            }

            vi.setSystemTime(dayjs().add(3, "h").toDate());
            const result = await sut.execute({ eventId: event.id });

            // Assert
            expect(result).toEqual({
                eventStatus: "active",
                currentLeads: 0,
                totalLeads: 3,
            });
        });

        it("should be possible to calculate the event status.", async () => {
            // Arrange - Criar evento com status diferente
            const inactiveEvent = await eventRepository.create(makeEvent({ status: "inactive" }));

            // Act
            const result = await sut.execute({ eventId: inactiveEvent.id });

            // Assert
            expect(result.eventStatus).toBe("inactive");
        });

        it("should be possible to calculate the metric for large volumes.", async () => {
            const offsets = [0, 15, 30, 45, 60, 90, 120];

            for (const minutes of offsets) {
                vi.setSystemTime(NOW.subtract(minutes, "minutes").toDate());
                await leadRepository.create(makeLead({
                    name: `Lead`,
                    phone: `21 90000040`,
                    email: `lea@email.com`,
                    eventId: event.id
                }));
            }

            vi.setSystemTime(NOW.toDate());

            const result = await sut.execute({ eventId: event.id });

            expect(result.currentLeads).toBe(4); // 0,15,30,45
            expect(result.totalLeads).toBe(7);
        });
    });

    describe("Error cases", () => {
        it("should not be possible to calculate metrics for an event that does not exist.", async () => {
            await expect(
                sut.execute({ eventId: "invalid-event-id" }),
            ).rejects.toBeInstanceOf(ResourceNotFoundError);
        });
    });
});

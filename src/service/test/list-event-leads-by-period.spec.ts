import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type { Event, IEventRepository } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { LeadInMemoryRepository } from "../../repository/in-memory/leads-repo";
import type { ILeadRepository } from "../../repository/lead";
import { ListEventLeadsByPeriodService } from "../list-event-leads-by-period";
import { makeEvent } from "./factorey/makeEvent";
import { makeLead } from "./factorey/makeLead";

describe("List event leads by period (Service)", () => {
    let sut: ListEventLeadsByPeriodService;
    let eventRepository: IEventRepository;
    let leadsRepository: ILeadRepository;
    let event: Event;

    const NOW = dayjs("2024-01-01T12:00:00Z");

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW.toDate());

        eventRepository = new EventInMemoryRepository();
        leadsRepository = new LeadInMemoryRepository();

        sut = new ListEventLeadsByPeriodService(
            eventRepository,
            leadsRepository,
        );

        event = await eventRepository.create(makeEvent({
            startAt: NOW.toDate(),
            endsAt: NOW.add(3, "hour").toDate(),
        }));

        afterEach(() => {
            vi.useRealTimers();
        });
    });

    describe("Successful cases", () => {
        it("should be possible to calculate the number of leads per period.", async () => {
            for (let ii = 0; ii < 3; ii++) {
                vi.setSystemTime(NOW.add(ii, "h").toDate());

                for (let i = 0; i < 3; i++) {
                    await leadsRepository.create(makeLead({
                        name: `Lead ${i}`,
                        phone: `217000000${i}`,
                        email: `leads${i}@email.com`,
                        eventId: event.id,
                    }));
                }
            }

            const result = await sut.execute({ eventId: event.id });

            expect(result.leads).toEqual([
                { hour: "2024-01-01T12:00:00.000Z", total: 3 },
                { hour: "2024-01-01T13:00:00.000Z", total: 3 },
                { hour: "2024-01-01T14:00:00.000Z", total: 3 },
            ]);
        });

        it("It should be possible to return zero when there are no metrics.", async () => {
            const result = await sut.execute({ eventId: event.id });

            expect(result.leads).toEqual([
                { hour: "2024-01-01T12:00:00.000Z", total: 0 },
                { hour: "2024-01-01T13:00:00.000Z", total: 0 },
                { hour: "2024-01-01T14:00:00.000Z", total: 0 },
            ]);
        });
    });

    describe("Error cases", () => {
        it("should not be possible to calculate metrics for an event that does not exist.", async () => {
            await expect(
                sut.execute({ eventId: "non-existent-id" }),
            ).rejects.toBeInstanceOf(ResourceNotFoundError);
        });
    });
});

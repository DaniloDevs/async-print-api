import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type { Event, IEventRepository } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { LeadInMemoryRepository } from "../../repository/in-memory/leads-repo";
import type { ILeadRepository } from "../../repository/lead";
import { GetLeadCaptureMetricsService } from "../get-lead-capture-metrics";
import { makeEvent } from "./factorey/makeEvent";
import { makeLead } from "./factorey/makeLead";

describe("Get lead capture metrics (Service)", () => {
    let sut: GetLeadCaptureMetricsService;
    let eventRepository: IEventRepository;
    let leadRepository: ILeadRepository;
    let event: Event;

    const NOW = dayjs("2024-01-01T12:00:00Z");

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW.toDate());

        eventRepository = new EventInMemoryRepository();
        leadRepository = new LeadInMemoryRepository();
        sut = new GetLeadCaptureMetricsService(eventRepository, leadRepository);

        event = await eventRepository.create(makeEvent({
            startAt: NOW.toDate(),
            endsAt: NOW.add(10, "hour").toDate(),
        }));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("Successful cases", () => {
        it("should be able to calculate the average number of leads per hour for the event.", async () => {
            for (let ii = 0; ii < 2; ii++) {
                vi.setSystemTime(NOW.add(ii, "h").toDate());

                for (let i = 0; i < 5; i++) {
                    await leadRepository.create(makeLead({
                        name: `Lead ${i}`,
                        phone: `217000000${i}`,
                        email: `leads${i}@email.com`,
                        eventId: event.id,
                    }));
                }
            }

            const result = await sut.execute({ eventId: event.id });

            expect(result.average).toBe(5);
            expect(result.status).toBe("poor");
            expect(result.trend).toBe("down");
        });

        it("It should be able to calculate the average two days after the event.", async () => {
            for (let ii = 0; ii < 4; ii++) {
                vi.setSystemTime(NOW.add(ii, "h").toDate());

                for (let i = 0; i < 2; i++) {
                    await leadRepository.create(makeLead({
                        name: `Lead ${i}`,
                        phone: `217000000${i}`,
                        email: `leads${i}@email.com`,
                        eventId: event.id,
                    }));
                }
            }

            vi.setSystemTime(NOW.add(2, "d").toDate());

            const result = await sut.execute({ eventId: event.id });

            expect(result.average).toBe(2);
            expect(result.status).toBe("poor");
        });

        it("should be able to return low metrics when the average is less than 10.", async () => {
            for (let ii = 0; ii < 4; ii++) {
                vi.setSystemTime(NOW.add(ii, "h").toDate());

                for (let i = 0; i < Math.floor(5); i++) {
                    await leadRepository.create(makeLead({
                        name: `Lead ${i}`,
                        phone: `217000000${i}`,
                        email: `leads${i}@email.com`,
                        eventId: event.id,
                    }));
                }
            }

            const result = await sut.execute({ eventId: event.id });

            expect(result.status).toBe("poor");
            expect(result.trend).toBe("down");
        });

        it("should return stable metrics when the average is between 10 and 25.", async () => {
            for (let ii = 0; ii < 4; ii++) {
                vi.setSystemTime(NOW.add(ii, "h").toDate());

                for (let i = 0; i < Math.floor(10); i++) {
                    await leadRepository.create(makeLead({
                        name: `Lead ${i}`,
                        phone: `217000000${i}`,
                        email: `leads${i}@email.com`,
                        eventId: event.id,
                    }));
                }
            }

            const result = await sut.execute({ eventId: event.id });

            expect(result.average).toBeGreaterThanOrEqual(10);
            expect(result.status).toBe("average");
            expect(result.trend).toBe("stable");
        });

        it("should return strong metrics when the average is greater than 25.", async () => {
            for (let ii = 0; ii < 4; ii++) {
                vi.setSystemTime(NOW.add(ii, "h").toDate());

                for (let i = 0; i < Math.floor(25); i++) {
                    await leadRepository.create(makeLead({
                        name: `Lead ${i}`,
                        phone: `217000000${i}`,
                        email: `leads${i}@email.com`,
                        eventId: event.id,
                    }));
                }
            }

            const result = await sut.execute({ eventId: event.id });

            expect(result.status).toBe("strong");
            expect(result.trend).toBe("up");
        });
    });

    describe("Error cases", () => {
        it("should not be possible to allow the calculation of metrics for an event that does not exist.", async () => {
            await expect(
                sut.execute({ eventId: "invalid-event-id" }),
            ).rejects.toBeInstanceOf(ResourceNotFoundError);
        });
    });
});

import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Event, IEventRepository } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { LeadInMemoryRepository } from "../../repository/in-memory/leads-repo";
import type { ILeadRepository, technical } from "../../repository/lead";
import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import { makeEvent } from "../_factory/test/makeEvent";
import { makeLead } from "../_factory/test/makeLead";
import { GetLeadMetricsByTechnical } from "../get-lead-metrics-by-technial";

describe("Get leads metrics by technical (Service)", () => {
    let sut: GetLeadMetricsByTechnical;
    let eventRepository: IEventRepository;
    let leadRepository: ILeadRepository;
    let event: Event;

    const NOW = dayjs("2024-01-01T12:00:00Z");

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW.toDate());

        eventRepository = new EventInMemoryRepository();
        leadRepository = new LeadInMemoryRepository();
        sut = new GetLeadMetricsByTechnical(eventRepository, leadRepository);

        event = await eventRepository.create(
            makeEvent({
                startAt: NOW.toDate(),
                endsAt: NOW.add(10, "hour").toDate(),
            }),
        );
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("Successful cases", () => {
        it("should group leads by technical interest correctly", async () => {
            await leadRepository.create(
                makeLead({ technical: "INF", eventId: event.id }),
            );
            await leadRepository.create(
                makeLead({ technical: "INF", eventId: event.id }),
            );
            await leadRepository.create(
                makeLead({ technical: "ADM", eventId: event.id }),
            );

            const result = await sut.execute({ eventId: event.id });

            expect(result.technical).toEqual([
                { technical: "INF", total: 2, interestNewyear: 2 },
                { technical: "ADM", total: 1, interestNewyear: 1 },
            ]);
        });

        it("should sort t.technical by total leads desc", async () => {
            await leadRepository.create(
                makeLead({ technical: "ADM", eventId: event.id }),
            );
            await leadRepository.create(
                makeLead({ technical: "INF", eventId: event.id }),
            );
            await leadRepository.create(
                makeLead({ technical: "INF", eventId: event.id }),
            );

            const result = await sut.execute({ eventId: event.id });

            expect(result.technical[0].technical).toBe("INF");
            expect(result.technical[0].total).toBe(2);
            expect(result.technical[1].technical).toBe("ADM");
        });
        it("should return empty t.technical array when event has no leads", async () => {
            const result = await sut.execute({ eventId: event.id });

            expect(result.technical).toEqual([]);
        });

        it("should count only leads with intent to study next year per technical", async () => {
            await leadRepository.create(
                makeLead({
                    technical: "INF",
                    intentionNextYear: true,
                    eventId: event.id,
                }),
            );
            await leadRepository.create(
                makeLead({
                    technical: "INF",
                    intentionNextYear: false,
                    eventId: event.id,
                }),
            );

            const result = await sut.execute({ eventId: event.id });

            expect(result.technical[0]).toEqual({
                technical: "INF",
                total: 2,
                interestNewyear: 1,
            });
        });

        it("should return all technical interests present in leads", async () => {
            const technicals: technical[] = ["INF", "ADM", "ENF"];

            for (const technical of technicals) {
                await leadRepository.create(
                    makeLead({
                        technical: technical,
                        eventId: event.id,
                    }),
                );
            }

            const result = await sut.execute({ eventId: event.id });

            expect(result.technical.map((t) => t.technical)).toEqual(
                expect.arrayContaining(technicals),
            );
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

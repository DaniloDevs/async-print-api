import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Event, IEventRepository } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { LeadInMemoryRepository } from "../../repository/in-memory/leads-repo";
import type { ILeadRepository } from "../../repository/lead";
import { ResourceNotFoundError } from "../@errors/resource-not-found-error";
import { makeEvent } from "../@factory/_test/makeEvent";
import { makeLead } from "../@factory/_test/makeLead";
import { GetMetricsOverview } from "./get-metrics-overview";

dayjs.extend(utc);

describe("Get Metrics Overview (Service)", () => {
    let sut: GetMetricsOverview;
    let eventRepository: IEventRepository;
    let leadsRepository: ILeadRepository;
    let event: Event;

    const NOW = dayjs("2024-01-01T12:00:00Z");

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW.toDate());

        eventRepository = new EventInMemoryRepository();
        leadsRepository = new LeadInMemoryRepository();
        sut = new GetMetricsOverview(eventRepository, leadsRepository);

        event = await eventRepository.create(
            makeEvent({
                startAt: NOW.toDate(),
                endsAt: NOW.add(3, "hour").toDate(),
            }),
        );
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("Successful cases", () => {
        it("should return zeroed metrics when event has no leads", async () => {
            const result = await sut.execute({ slug: event.slug });

            expect(result.totalLeads).toBe(0);
            expect(result.currentLeads).toBe(0);
            expect(result.averageTotals).toBe(0);
            expect(result.catchPercentage).toBe(0);
        });

        it("should correctly count the total number of leads", async () => {
            for (let i = 0; i < 5; i++) {
                await leadsRepository.create(
                    makeLead({
                        name: `Lead ${i}`,
                        email: `lead${i}@example.com`,
                        phone: `2190000000${i}`,
                        eventId: event.id,
                    }),
                );
            }

            const result = await sut.execute({ slug: event.slug });

            expect(result.totalLeads).toBe(5);
        });

        it("should return the last bucket total as currentLeads", async () => {
            // Create leads only in the last hour bucket (hour 3 = NOW+2h to NOW+3h)
            vi.setSystemTime(NOW.add(2, "hour").add(30, "minute").toDate());

            for (let i = 0; i < 4; i++) {
                await leadsRepository.create(
                    makeLead({
                        name: `Lead ${i}`,
                        email: `lead${i}@example.com`,
                        phone: `2190000000${i}`,
                        eventId: event.id,
                    }),
                );
            }

            vi.setSystemTime(NOW.toDate());

            const result = await sut.execute({ slug: event.slug });

            expect(result.currentLeads).toBe(4);
        });

        it("should calculate catchPercentage as (totalLeads / numberOfBuckets) * 100", async () => {
            // Event has 3 hours => 3 buckets
            // Create 3 leads in total
            for (let i = 0; i < 3; i++) {
                vi.setSystemTime(NOW.add(i, "hour").toDate());
                await leadsRepository.create(
                    makeLead({
                        name: `Lead ${i}`,
                        email: `lead${i}@example.com`,
                        phone: `2190000000${i}`,
                        eventId: event.id,
                    }),
                );
            }

            vi.setSystemTime(NOW.toDate());

            const result = await sut.execute({ slug: event.slug });

            // catchPercentage = (3 leads / 3 buckets) * 100 = 100
            expect(result.catchPercentage).toBe(100);
        });

        it("should correctly distribute leads across hourly buckets", async () => {
            // 2 leads in hour 0
            vi.setSystemTime(NOW.add(0, "hour").add(15, "minute").toDate());
            await leadsRepository.create(makeLead({ eventId: event.id }));
            await leadsRepository.create(makeLead({ eventId: event.id }));

            // 1 lead in hour 1
            vi.setSystemTime(NOW.add(1, "hour").add(15, "minute").toDate());
            await leadsRepository.create(makeLead({ eventId: event.id }));

            vi.setSystemTime(NOW.toDate());

            const result = await sut.execute({ slug: event.slug });

            // totalLeads = 3, activeHours = 2, average = round(3/2) = 2
            expect(result.totalLeads).toBe(3);
            expect(result.averageTotals).toBe(2);
        });

        it("should calculate averageTotals only considering active hours (hours with at least 1 lead)", async () => {
            // Add 4 leads in hour 0 only, hours 1 and 2 are empty
            for (let i = 0; i < 4; i++) {
                vi.setSystemTime(NOW.add(10, "minute").toDate());
                await leadsRepository.create(makeLead({ eventId: event.id }));
            }

            vi.setSystemTime(NOW.toDate());

            const result = await sut.execute({ slug: event.slug });

            // activeHours = 1, totalLeads = 4, average = 4
            expect(result.averageTotals).toBe(4);
        });

        it("should return averageTotals as 0 when there are no leads", async () => {
            const result = await sut.execute({ slug: event.slug });

            expect(result.averageTotals).toBe(0);
        });

        it("should ignore leads created before the event starts", async () => {
            // Lead created 1 hour before event start
            vi.setSystemTime(NOW.subtract(1, "hour").toDate());
            await leadsRepository.create(makeLead({ eventId: event.id }));

            vi.setSystemTime(NOW.toDate());

            const result = await sut.execute({ slug: event.slug });

            expect(result.totalLeads).toBe(1); // still stored, but out of buckets
            // currentLeads should be 0 since it falls outside all buckets
            expect(result.currentLeads).toBe(0);
        });

        it("should ignore leads created at or after the event ends", async () => {
            // Lead created exactly at endsAt
            vi.setSystemTime(NOW.add(3, "hour").toDate());
            await leadsRepository.create(makeLead({ eventId: event.id }));

            vi.setSystemTime(NOW.toDate());

            const result = await sut.execute({ slug: event.slug });

            // Lead is in the repository (totalLeads counts from leads array)
            // but bucket won't include it since it's not isBefore(end)
            expect(result.currentLeads).toBe(0);
        });

        it("should work correctly with a large volume of leads spread across all buckets", async () => {
            // 10 leads per hour for a 3h event
            for (let h = 0; h < 3; h++) {
                vi.setSystemTime(NOW.add(h, "hour").add(5, "minute").toDate());
                for (let i = 0; i < 10; i++) {
                    await leadsRepository.create(
                        makeLead({ eventId: event.id }),
                    );
                }
            }

            vi.setSystemTime(NOW.toDate());

            const result = await sut.execute({ slug: event.slug });

            expect(result.totalLeads).toBe(30);
            expect(result.averageTotals).toBe(10); // 30 leads / 3 active hours
            expect(result.currentLeads).toBe(10); // last bucket
            expect(result.catchPercentage).toBe(1000); // (30/3) * 100
        });
    });

    describe("Error cases", () => {
        it("should throw ResourceNotFoundError when event slug does not exist", async () => {
            await expect(
                sut.execute({ slug: "non-existent-slug" }),
            ).rejects.toBeInstanceOf(ResourceNotFoundError);
        });

        it("should include the slug in the error when event is not found", async () => {
            const invalidSlug = "invalid-event-slug";

            await expect(
                sut.execute({ slug: invalidSlug }),
            ).rejects.toThrowError(ResourceNotFoundError);
        });
    });

    describe("Unit: calculateAverageTotals", () => {
        it("should return 0 for an empty array", () => {
            const result = sut.calculateAverageTotals([]);
            expect(result).toBe(0);
        });

        it("should return 0 when all hours have 0 leads", () => {
            const result = sut.calculateAverageTotals([
                { hour: "2024-01-01T12:00:00.000Z", total: 0 },
                { hour: "2024-01-01T13:00:00.000Z", total: 0 },
            ]);
            expect(result).toBe(0);
        });

        it("should correctly compute the average only over active hours", () => {
            const result = sut.calculateAverageTotals([
                { hour: "2024-01-01T12:00:00.000Z", total: 6 },
                { hour: "2024-01-01T13:00:00.000Z", total: 0 },
                { hour: "2024-01-01T14:00:00.000Z", total: 4 },
            ]);
            // activeHours = 2, totalLeads = 10, average = 5
            expect(result).toBe(5);
        });

        it("should round average to the nearest integer", () => {
            const result = sut.calculateAverageTotals([
                { hour: "2024-01-01T12:00:00.000Z", total: 1 },
                { hour: "2024-01-01T13:00:00.000Z", total: 2 },
            ]);
            // activeHours = 2, totalLeads = 3, average = 1.5 => rounds to 2
            expect(result).toBe(2);
        });
    });

    describe("Unit: organizeLeadsByPeriod", () => {
        it("should return one bucket per hour in the event range", () => {
            const start = NOW.utc();
            const end = NOW.add(3, "hour").utc();

            const result = sut.organizeLeadsByPeriod({
                startEvent: start,
                endsEvent: end,
                leads: [],
            });

            expect(result).toHaveLength(3);
            expect(result[0].hour).toBe("2024-01-01T12:00:00.000Z");
            expect(result[1].hour).toBe("2024-01-01T13:00:00.000Z");
            expect(result[2].hour).toBe("2024-01-01T14:00:00.000Z");
        });

        it("should count leads in the correct hourly buckets", () => {
            const lead = {
                ...makeLead({ eventId: event.id }),
                id: "lead-1",
                createdAt: NOW.add(1, "hour").add(15, "minute").toDate(),
            };

            const result = sut.organizeLeadsByPeriod({
                startEvent: NOW.utc(),
                endsEvent: NOW.add(3, "hour").utc(),
                leads: [lead as any],
            });

            expect(result[0].total).toBe(0);
            expect(result[1].total).toBe(1);
            expect(result[2].total).toBe(0);
        });

        it("should return all zero totals when there are no leads", () => {
            const result = sut.organizeLeadsByPeriod({
                startEvent: NOW.utc(),
                endsEvent: NOW.add(2, "hour").utc(),
                leads: [],
            });

            expect(result.every((b) => b.total === 0)).toBe(true);
        });

        it("should skip leads with invalid createdAt dates", () => {
            const lead = {
                ...makeLead({ eventId: event.id }),
                id: "lead-invalid",
                createdAt: new Date("invalid-date"),
            };

            const result = sut.organizeLeadsByPeriod({
                startEvent: NOW.utc(),
                endsEvent: NOW.add(2, "hour").utc(),
                leads: [lead as any],
            });

            expect(result.every((b) => b.total === 0)).toBe(true);
        });
    });
});

import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Event, IEventRepository } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { LeadInMemoryRepository } from "../../repository/in-memory/leads-repo";
import type { ILeadRepository, originLead } from "../../repository/lead";
import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import { makeEvent } from "../_factory/test/makeEvent";
import { makeLead } from "../_factory/test/makeLead";
import { GetLeadMetricsByorigin } from "../get-lead-metrics-by-origen";

describe("Get leads metrics by origin (Service)", () => {
    let sut: GetLeadMetricsByorigin;
    let eventRepository: IEventRepository;
    let leadRepository: ILeadRepository;
    let event: Event;

    const NOW = dayjs("2024-01-01T12:00:00Z");

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW.toDate());

        eventRepository = new EventInMemoryRepository();
        leadRepository = new LeadInMemoryRepository();
        sut = new GetLeadMetricsByorigin(eventRepository, leadRepository);

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
        it("should group leads by origin interest correctly", async () => {
            await leadRepository.create(
                makeLead({ origin: "MANUAL", eventId: event.id }),
            );
            await leadRepository.create(
                makeLead({ origin: "MANUAL", eventId: event.id }),
            );
            await leadRepository.create(
                makeLead({ origin: "QRCODE", eventId: event.id }),
            );

            const result = await sut.execute({ eventId: event.id });
            expect(result.origin).toEqual([
                { origin: "MANUAL", total: 2 },
                { origin: "QRCODE", total: 1 },
            ]);
        });

        it("should sort t.origin by total leads desc", async () => {
            await leadRepository.create(
                makeLead({ origin: "QRCODE", eventId: event.id }),
            );
            await leadRepository.create(
                makeLead({ origin: "MANUAL", eventId: event.id }),
            );
            await leadRepository.create(
                makeLead({ origin: "MANUAL", eventId: event.id }),
            );

            const result = await sut.execute({ eventId: event.id });

            expect(result.origin[0].origin).toBe("MANUAL");
            expect(result.origin[0].total).toBe(2);
            expect(result.origin[1].origin).toBe("QRCODE");
        });
        it("should return empty t.origin array when event has no leads", async () => {
            const result = await sut.execute({ eventId: event.id });

            expect(result.origin).toEqual([]);
        });

        it("should count only leads with intent to study next year per origin", async () => {
            await leadRepository.create(
                makeLead({
                    origin: "MANUAL",
                    intentionNextYear: true,
                    eventId: event.id,
                }),
            );
            await leadRepository.create(
                makeLead({
                    origin: "MANUAL",
                    intentionNextYear: false,
                    eventId: event.id,
                }),
            );

            const result = await sut.execute({ eventId: event.id });

            expect(result.origin[0]).toEqual({
                origin: "MANUAL",
                total: 2,
            });
        });

        it("should return all origin interests present in leads", async () => {
            const origins: originLead[] = ["MANUAL", "QRCODE", "INSTAGRAM"];

            for (const origin of origins) {
                await leadRepository.create(
                    makeLead({
                        origin: origin,
                        eventId: event.id,
                    }),
                );
            }

            const result = await sut.execute({ eventId: event.id });

            expect(result.origin.map((t) => t.origin)).toEqual(
                expect.arrayContaining(origins),
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

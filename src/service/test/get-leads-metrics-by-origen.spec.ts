import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type { Event, IEventRepository } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { LeadInMemoryRepository } from "../../repository/in-memory/leads-repo";
import type { ILeadRepository, OrigenLead } from "../../repository/lead";
import { GetLeadMetricsByOrigen } from "../get-lead-metrics-by-origen";
import { makeEvent } from "./factorey/makeEvent";
import { makeLead } from "./factorey/makeLead";

describe("Get leads metrics by origen (Service)", () => {
    let sut: GetLeadMetricsByOrigen;
    let eventRepository: IEventRepository;
    let leadRepository: ILeadRepository;
    let event: Event;

    const NOW = dayjs("2024-01-01T12:00:00Z");

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW.toDate());

        eventRepository = new EventInMemoryRepository();
        leadRepository = new LeadInMemoryRepository();
        sut = new GetLeadMetricsByOrigen(eventRepository, leadRepository);

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
        it("should group leads by origen interest correctly", async () => {
            await leadRepository.create(
                makeLead({ origen: "manual", eventId: event.id }),
            );
            await leadRepository.create(
                makeLead({ origen: "manual", eventId: event.id }),
            );
            await leadRepository.create(
                makeLead({ origen: "qrcode", eventId: event.id }),
            );

            const result = await sut.execute({ eventId: event.id });
            expect(result.origen).toEqual([
                { origen: "manual", total: 2 },
                { origen: "qrcode", total: 1 },
            ]);
        });

        it("should sort t.origen by total leads desc", async () => {
            await leadRepository.create(
                makeLead({ origen: "qrcode", eventId: event.id }),
            );
            await leadRepository.create(
                makeLead({ origen: "manual", eventId: event.id }),
            );
            await leadRepository.create(
                makeLead({ origen: "manual", eventId: event.id }),
            );

            const result = await sut.execute({ eventId: event.id });

            expect(result.origen[0].origen).toBe("manual");
            expect(result.origen[0].total).toBe(2);
            expect(result.origen[1].origen).toBe("qrcode");
        });
        it("should return empty t.origen array when event has no leads", async () => {
            const result = await sut.execute({ eventId: event.id });

            expect(result.origen).toEqual([]);
        });

        it("should count only leads with intent to study next year per origen", async () => {
            await leadRepository.create(
                makeLead({
                    origen: "manual",
                    intendsToStudyNextYear: true,
                    eventId: event.id,
                }),
            );
            await leadRepository.create(
                makeLead({
                    origen: "manual",
                    intendsToStudyNextYear: false,
                    eventId: event.id,
                }),
            );

            const result = await sut.execute({ eventId: event.id });

            expect(result.origen[0]).toEqual({
                origen: "manual",
                total: 2,
            });
        });

        it("should return all origen interests present in leads", async () => {
            const origens: OrigenLead[] = ["manual", "qrcode", "instagram"];

            for (const origen of origens) {
                await leadRepository.create(
                    makeLead({
                        origen: origen,
                        eventId: event.id,
                    }),
                );
            }

            const result = await sut.execute({ eventId: event.id });

            expect(result.origen.map((t) => t.origen)).toEqual(
                expect.arrayContaining(origens),
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

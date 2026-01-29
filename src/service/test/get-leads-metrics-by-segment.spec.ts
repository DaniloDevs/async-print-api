import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type { Event, IEventRepository } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { LeadInMemoryRepository } from "../../repository/in-memory/leads-repo";
import type { ILeadRepository, SegmentInterest } from "../../repository/lead";
import { GetLeadMetricsBySegment } from "../get-lead-metrics-by-segment";
import { makeEvent } from "./factorey/makeEvent";
import { makeLead } from "./factorey/makeLead";

describe("Get leads metrics by segment (Service)", () => {
    let sut: GetLeadMetricsBySegment;
    let eventRepository: IEventRepository;
    let leadRepository: ILeadRepository;
    let event: Event;

    const NOW = dayjs("2024-01-01T12:00:00Z");

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW.toDate());

        eventRepository = new EventInMemoryRepository();
        leadRepository = new LeadInMemoryRepository();
        sut = new GetLeadMetricsBySegment(eventRepository, leadRepository);

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
        it("should group leads by segment interest correctly", async () => {
            await leadRepository.create(
                makeLead({ segmentInterest: "ANO_1_MEDIO", eventId: event.id }),
            );
            await leadRepository.create(
                makeLead({ segmentInterest: "ANO_1_MEDIO", eventId: event.id }),
            );
            await leadRepository.create(
                makeLead({ segmentInterest: "ANO_2_MEDIO", eventId: event.id }),
            );

            const result = await sut.execute({ eventId: event.id });

            expect(result.segments).toEqual([
                { segment: "ANO_1_MEDIO", total: 2, interestNewyear: 2 },
                { segment: "ANO_2_MEDIO", total: 1, interestNewyear: 1 },
            ]);
        });

        it("should sort t.segment by total leads desc", async () => {
            await leadRepository.create(
                makeLead({ segmentInterest: "ANO_2_MEDIO", eventId: event.id }),
            );
            await leadRepository.create(
                makeLead({ segmentInterest: "ANO_1_MEDIO", eventId: event.id }),
            );
            await leadRepository.create(
                makeLead({ segmentInterest: "ANO_1_MEDIO", eventId: event.id }),
            );

            const result = await sut.execute({ eventId: event.id });

            expect(result.segments[0].segment).toBe("ANO_1_MEDIO");
            expect(result.segments[0].total).toBe(2);
            expect(result.segments[1].segment).toBe("ANO_2_MEDIO");
        });
        it("should return empty t.segment array when event has no leads", async () => {
            const result = await sut.execute({ eventId: event.id });

            expect(result.segments).toEqual([]);
        });

        it("should count only leads with intent to study next year per segment", async () => {
            await leadRepository.create(
                makeLead({
                    segmentInterest: "ANO_1_MEDIO",
                    intendsToStudyNextYear: true,
                    eventId: event.id,
                }),
            );
            await leadRepository.create(
                makeLead({
                    segmentInterest: "ANO_1_MEDIO",
                    intendsToStudyNextYear: false,
                    eventId: event.id,
                }),
            );

            const result = await sut.execute({ eventId: event.id });

            expect(result.segments[0]).toEqual({
                segment: "ANO_1_MEDIO",
                total: 2,
                interestNewyear: 1,
            });
        });

        it("should return all segment interests present in leads", async () => {
            const segments: SegmentInterest[] = [
                "ANO_1_MEDIO",
                "ANO_2_MEDIO",
                "ANO_3_MEDIO",
            ];

            for (const segment of segments) {
                await leadRepository.create(
                    makeLead({
                        segmentInterest: segment,
                        eventId: event.id,
                    }),
                );
            }

            const result = await sut.execute({ eventId: event.id });

            expect(result.segments.map((t) => t.segment)).toEqual(
                expect.arrayContaining(segments),
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

import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type { Event } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { LeadInMemoryRepository } from "../../repository/in-memory/leads-repo";
import { ExportEventLeadsService } from "../export-event-leads";

describe("Export event Lead (Service)", () => {
    let eventRepository: EventInMemoryRepository;
    let leadRepository: LeadInMemoryRepository;
    let sut: ExportEventLeadsService;
    let event: Event;

    const NOW = dayjs("2024-01-01T12:00:00Z");

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW.toDate());

        eventRepository = new EventInMemoryRepository();
        leadRepository = new LeadInMemoryRepository();

        sut = new ExportEventLeadsService(eventRepository, leadRepository);

        event = await eventRepository.create({
            title: "Event Test",
            bannerKey: null,
            status: "active",
            startAt: NOW.toDate(),
            endsAt: NOW.add(10, "hour").toDate(),
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("Successful cases", () => {
        it(" should be possible to export leads from an event.", async () => {
            const leadsCount = 5;

            for (let i = 0; i < leadsCount; i++) {
                await leadRepository.create({
                    name: `Lead ${i}`,
                    phone: `21 90000000${i}`,
                    email: `lead${i}@email.com`,
                    isStudent: true,
                    intendsToStudyNextYear: true,
                    technicalInterest: "INF",
                    segmentInterest: "ANO_1_MEDIO",
                    eventId: event.id,
                          origen: "manual"
                });
            }

            const result = await sut.execute({ slug: event.slug });

            expect(result.leads).toHaveLength(leadsCount);
        });

        it("should be possible to return an empty list of leads from an event.", async () => {
            const result = await sut.execute({ slug: event.slug });

            expect(result.leads).toEqual([]);
        });
    });
    describe("Error cases", () => {
        it("should not be possible to export leads from an non-existent event.", async () => {
            await expect(
                sut.execute({ slug: "non-exist" }),
            ).rejects.toBeInstanceOf(ResourceNotFoundError);
        });
    });
});

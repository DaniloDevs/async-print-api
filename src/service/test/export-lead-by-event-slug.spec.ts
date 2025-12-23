import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type { Events } from "../../repository/events";
import { EventsInMemomryRepository } from "../../repository/in-memory/events-repo";
import { LeadsInMemomryRepository } from "../../repository/in-memory/leads-repo";
import { ExportLeadByEventSlugService } from "../export-lead-by-event-slug";

describe("Export Lead by Event Slug - Service", () => {
    let eventRepository: EventsInMemomryRepository;
    let leadRepository: LeadsInMemomryRepository;
    let service: ExportLeadByEventSlugService;

    let event: Events;

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(dayjs("2021-01-25").toDate());

        eventRepository = new EventsInMemomryRepository();
        leadRepository = new LeadsInMemomryRepository();

        vi.spyOn(leadRepository, "findManyByEventId");

        service = new ExportLeadByEventSlugService(
            eventRepository,
            leadRepository,
        );

        event = await eventRepository.create({
            title: "Event Test",
            bannerKey: null,
            isActivated: true,
            startAt: dayjs("2021-01-25").toDate(),
            endsAt: dayjs("2021-01-25").add(3, "day").toDate(),
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it("exports leads from an event by slug", async () => {
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

        const result = await service.execute(event.slug);

        expect(result).toEqual({
            eventId: event.id,
            eventSlug: event.slug,
            eventTitle: event.title,
            leads: expect.arrayContaining([
                expect.objectContaining({
                    name: "Lead 1",
                    email: "lead1@email.com",
                }),
            ]),
        });

        expect(leadRepository.findManyByEventId).toHaveBeenCalledWith(event.id);
    });

    it("returns empty leads array when event has no leads", async () => {
        const result = await service.execute(event.slug);

        expect(result.leads).toEqual([]);
        expect(leadRepository.findManyByEventId).toHaveBeenCalledWith(event.id);
    });

    it("throws ResourceNotFoundError when event does not exist", async () => {
        await expect(
            service.execute("non-existent-event"),
        ).rejects.toBeInstanceOf(ResourceNotFoundError);
    });

    it("exports all leads related to the event", async () => {
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
            });
        }

        const result = await service.execute(event.slug);

        expect(result.leads).toHaveLength(leadsCount);
        expect(leadRepository.findManyByEventId).toHaveBeenCalledTimes(1);
    });
});

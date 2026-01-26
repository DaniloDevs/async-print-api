import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type { Event } from "./../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { LeadInMemoryRepository } from "../../repository/in-memory/leads-repo";
import { ExportLeadByEventSlugService } from "../export-lead-by-event-slug";

describe("Export Lead by Event Slug - Service", () => {
    let eventRepository: EventInMemoryRepository;
    let leadRepository: LeadInMemoryRepository;
    let service: ExportLeadByEventSlugService;

    let event: Event;

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(dayjs("2021-01-25").toDate());

        eventRepository = new EventInMemoryRepository();
        leadRepository = new LeadInMemoryRepository();

        vi.spyOn(leadRepository, "findManyByEventId");

        service = new ExportLeadByEventSlugService(
            eventRepository,
            leadRepository,
        );

        event = await eventRepository.create({
            title: "Event Test",
            bannerKey: null,
            status: "active",
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

        const result = await service.execute({ slug: event.slug });

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
        const result = await service.execute({ slug: event.slug });

        expect(result.leads).toEqual([]);
        expect(leadRepository.findManyByEventId).toHaveBeenCalledWith(event.id);
    });

    it("throws ResourceNotFoundError when event does not exist", async () => {
        await expect(
            service.execute({ slug: "non-exist" }),
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

        const result = await service.execute({ slug: event.slug });

        expect(result.leads).toHaveLength(leadsCount);
        expect(leadRepository.findManyByEventId).toHaveBeenCalledTimes(1);
    });
});

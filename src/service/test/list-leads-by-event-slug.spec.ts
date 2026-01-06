import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type { Events, IEventsRepository } from "../../repository/events";
import { EventsInMemomryRepository } from "../../repository/in-memory/events-repo";
import { LeadsInMemomryRepository } from "../../repository/in-memory/leads-repo";
import type { ILeadsrepository } from "../../repository/leads";
import { ListLeadsByEventSlug } from "../list-leads-by-event-slug";

describe("List Leads By Event Slug - Service", () => {
    let service: ListLeadsByEventSlug;
    let eventRepository: IEventsRepository;
    let leadsRepository: ILeadsrepository;

    let event: Events;

    beforeEach(async () => {
        eventRepository = new EventsInMemomryRepository();
        leadsRepository = new LeadsInMemomryRepository();

        service = new ListLeadsByEventSlug(eventRepository, leadsRepository);

        event = await eventRepository.create({
            title: "Event Test",
            bannerKey: null,
            status: "active",
            startAt: new Date("2021-01-25"),
            endsAt: new Date("2021-01-28"),
        });
    });

    it("returns all leads related to the event slug", async () => {
        const leadsCount = 5;

        for (let i = 0; i < leadsCount; i++) {
            await leadsRepository.create({
                name: `Lead ${i}`,
                phone: `2190000000${i}`,
                email: `lead${i}@email.com`,
                isStudent: true,
                intendsToStudyNextYear: true,
                technicalInterest: "INF",
                segmentInterest: "ANO_1_MEDIO",
                eventId: event.id,
            });
        }

        const result = await service.execute(event.slug);

        expect(result).toHaveLength(leadsCount);
        expect(result.every((lead) => lead.eventId === event.id)).toBe(true);
    });

    it("returns an empty array when the event has no leads", async () => {
        const result = await service.execute(event.slug);

        expect(result).toEqual([]);
    });

    it("throws ResourceNotFoundError when event slug does not exist", async () => {
        await expect(
            service.execute("non-existent-slug"),
        ).rejects.toBeInstanceOf(ResourceNotFoundError);
    });
});

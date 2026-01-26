import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type { Event } from "./../../repository/event";
import type { IEventRepository } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { LeadInMemoryRepository } from "../../repository/in-memory/leads-repo";
import type { ILeadRepository } from "../../repository/lead";
import { ListLeadsByEventSlug } from "../list-leads-by-event-slug";

describe("List Leads By Event Slug - Service", () => {
    let service: ListLeadsByEventSlug;
    let eventRepository: IEventRepository;
    let leadsRepository: ILeadRepository;

    let event: Event;

    beforeEach(async () => {
        eventRepository = new EventInMemoryRepository();
        leadsRepository = new LeadInMemoryRepository();

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

        const { leads } = await service.execute({ slug: event.slug });

        expect(leads).toHaveLength(leadsCount);
        expect(leads.every((lead) => lead.eventId === event.id)).toBe(true);
    });

    it("returns an empty array when the event has no leads", async () => {
        const { leads } = await service.execute({ slug: event.slug });

        expect(leads).toEqual([]);
    });

    it("throws ResourceNotFoundError when event slug does not exist", async () => {
        await expect(
            service.execute({ slug: "non-existent-slug" }),
        ).rejects.toBeInstanceOf(ResourceNotFoundError);
    });
});

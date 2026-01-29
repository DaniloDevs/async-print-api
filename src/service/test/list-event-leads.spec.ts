import dayjs from "dayjs";
import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type { Event, IEventRepository } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { LeadInMemoryRepository } from "../../repository/in-memory/leads-repo";
import type { ILeadRepository } from "../../repository/lead";
import { ListEventLeadsService } from "../list-event-leads";
import { makeEvent } from "./factorey/makeEvent";
import { makeLead } from "./factorey/makeLead";

describe("List event leads (Service)", () => {
    let sut: ListEventLeadsService;
    let eventRepository: IEventRepository;
    let leadsRepository: ILeadRepository;
    let event: Event;

    const NOW = dayjs("2024-01-01T12:00:00Z");

    beforeEach(async () => {
        eventRepository = new EventInMemoryRepository();
        leadsRepository = new LeadInMemoryRepository();

        sut = new ListEventLeadsService(eventRepository, leadsRepository);

        event = await eventRepository.create(makeEvent({
            startAt: NOW.toDate(),
            endsAt: NOW.add(10, "hour").toDate(),
        }));
    });

    describe("Successful cases", () => {
        it("should be possible to list leads from an event.", async () => {
            const leadsCount = 5;

            for (let i = 0; i < leadsCount; i++) {
                await leadsRepository.create(makeLead({
                    name: `Lead ${i}`,
                    phone: `2190000000${i}`,
                    email: `lead${i}@email.com`,
                    eventId: event.id,
                }));
            }

            const { leads } = await sut.execute({ slug: event.slug });

            expect(leads).toHaveLength(leadsCount);
            expect(leads.every((lead) => lead.eventId === event.id)).toBe(true);
        });

        it("It should be possible to display an empty list when there are no leads.", async () => {
            const { leads } = await sut.execute({ slug: event.slug });

            expect(leads).toEqual([]);
        });
    });

    describe("Error cases", () => {
        it("should not be possible to list leads for an event that does not exist", async () => {
            await expect(
                sut.execute({ slug: "non-existent-slug" }),
            ).rejects.toBeInstanceOf(ResourceNotFoundError);
        });
    });
});

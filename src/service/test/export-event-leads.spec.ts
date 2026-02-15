import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Event } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { LeadInMemoryRepository } from "../../repository/in-memory/leads-repo";
import { LeadsNotFoundError } from "../_errors/leads-not-found-error";
import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import { makeEvent } from "../_factory/makeEvent";
import { makeLead } from "../_factory/makeLead";
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

        event = await eventRepository.create(makeEvent());
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("Successful cases", () => {
        it(" should be possible to export leads from an event.", async () => {
            const leadsCount = 5;

            for (let i = 0; i < leadsCount; i++) {
                await leadRepository.create(
                    makeLead({
                        name: `Lead ${i}`,
                        phone: `21 90000000${i}`,
                        email: `lead${i}@email.com`,
                        eventId: event.id,
                    }),
                );
            }

            const result = await sut.execute({ slug: event.slug });
            expect(result.leads).toHaveLength(leadsCount);
        });
    });
    describe("Error cases", () => {
        it("should be possible to return an empty list of leads from an event.", async () => {
            await expect(
                sut.execute({ slug: event.slug }),
            ).rejects.toBeInstanceOf(LeadsNotFoundError);
        });

        it("should not be possible to export leads from an non-existent event.", async () => {
            await expect(
                sut.execute({ slug: "non-exist" }),
            ).rejects.toBeInstanceOf(ResourceNotFoundError);
        });
    });
});

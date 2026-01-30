import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventAlreadyEndedError } from "../../_errors/event-already-ended-error";
import { EventNotActiveError } from "../../_errors/event-not-active-error";
import { EventNotStartedYetError } from "../../_errors/event-not-started-yet-error";
import { LeadAlreadyRegisteredError } from "../../_errors/lead-already-registered-error";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type { IEventRepository } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { LeadInMemoryRepository } from "../../repository/in-memory/leads-repo";
import type { ILeadRepository } from "../../repository/lead";
import { CreateLeadService } from "../create-lead";
import { makeEvent } from "./factorey/makeEvent";
import { makeLead } from "./factorey/makeLead";

describe("Create Lead (Service)", () => {
    let eventRepository: IEventRepository;
    let leadRepository: ILeadRepository;
    let sut: CreateLeadService;

    const NOW = dayjs("2024-01-01T12:00:00Z");

    const eventInput = makeEvent();
    const leadInput = makeLead();

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW.toDate());

        eventRepository = new EventInMemoryRepository();
        leadRepository = new LeadInMemoryRepository();
        sut = new CreateLeadService(eventRepository, leadRepository);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("Successful cases", () => {
        it("should be able create lead", async () => {
            const event = await eventRepository.create(eventInput);

            const { lead } = await sut.execute({
                data: { ...leadInput, eventId: event.id },
                eventId: event.id,
            });

            expect(lead.name).toBe("Danilo Ribeiro Pinho");
        });

        it("should be able create lead with normalize phone number", async () => {
            const event = await eventRepository.create(eventInput);

            const { lead } = await sut.execute({
                data: { ...leadInput, eventId: event.id },
                eventId: event.id,
            });

            const normalizedPhoneNumber = sut.normalizePhoneNumber(
                leadInput.phone,
            );

            expect(lead.phone).toBe(normalizedPhoneNumber);
        });
    });

    describe("Error cases", () => {
        it("should not be possible to create a lead for an event that doesn't exist.", async () => {
            eventRepository.findBySlug("non-exist-event");

            await expect(() =>
                sut.execute({ data: leadInput, eventId: "non-exist" }),
            ).rejects.toBeInstanceOf(ResourceNotFoundError);
        });

        it("should not be possible to create a lead in an event that is not active.", async () => {
            const event = await eventRepository.create({
                ...eventInput,
                status: "inactive",
            });

            await expect(() =>
                sut.execute({
                    data: { ...leadInput, eventId: event.id },
                    eventId: event.id,
                }),
            ).rejects.toBeInstanceOf(EventNotActiveError);
        });

        it("should not be possible to create a lead in an event that has not yet started.", async () => {
            const event = await eventRepository.create({
                ...eventInput,
            });

            vi.setSystemTime(NOW.subtract(2, "day").toDate());
            await expect(() =>
                sut.execute({
                    data: { ...leadInput, eventId: event.id },
                    eventId: event.id,
                }),
            ).rejects.toBeInstanceOf(EventNotStartedYetError);
        });

        it("should not be possible to create a lead in an event that has ended.", async () => {
            const event = await eventRepository.create(eventInput);

            vi.setSystemTime(NOW.add(2, "day").toDate());
            await expect(() =>
                sut.execute({
                    data: { ...leadInput, eventId: event.id },
                    eventId: event.id,
                }),
            ).rejects.toBeInstanceOf(EventAlreadyEndedError);
        });

        it("should not be possible to register the same lead twice.", async () => {
            const event = await eventRepository.create(eventInput);
            await leadRepository.create(leadInput);

            await expect(() =>
                Promise.all([
                    sut.execute({
                        data: { ...leadInput, eventId: event.id },
                        eventId: event.id,
                    }),
                    sut.execute({
                        data: { ...leadInput, eventId: event.id },
                        eventId: event.id,
                    }),
                ]),
            ).rejects.toBeInstanceOf(LeadAlreadyRegisteredError);
        });
    });
});

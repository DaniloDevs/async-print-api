import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventAlreadyExistsError } from "../../_errors/event-already-exist-error";
import { EventEndBeforeStartError } from "../../_errors/event-end-before-start-error";
import { EventStartDateInPastError } from "../../_errors/event-start-date-in-past-error";
import type {
    EventCreateInput,
    IEventRepository,
} from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { createSlug } from "../../utils/create-slug";
import { CreateEventService } from "../create-event";
import { makeEvent } from "./factorey/makeEvent";

describe("Create Event (Service)", () => {
    let eventRepository: IEventRepository;
    let sut: CreateEventService;

    const NOW = dayjs("2024-01-01T12:00:00Z");

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW.toDate());

        eventRepository = new EventInMemoryRepository();
        sut = new CreateEventService(eventRepository);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("Successful cases", () => {
        it("should be able to create a new event", async () => {
            const eventData = makeEvent({
                startAt: NOW.toDate(),
                endsAt: NOW.add(5, "hour").toDate(),
            })

            const { event } = await sut.execute({ data: eventData });

            expect(event.id).toEqual(expect.any(String));
            expect(event.slug).toBe(createSlug(eventData.title));
            expect(event.startAt.getTime()).toBe(eventData.startAt.getTime());
        });

        it("should be able create event with end date exactly 1 minute after start", async () => {
            const eventData = makeEvent({
                startAt: NOW.toDate(),
                endsAt: NOW.add(1, "minute").toDate(),
            })

            const { event } = await sut.execute({ data: eventData });

            expect(event.id).toEqual(expect.any(String));
            expect(dayjs(event.endsAt).isAfter(event.startAt)).toBe(true);
        });

        it("should create event starting exactly now", async () => {
            const eventData = makeEvent({
                startAt: NOW.toDate(),
                endsAt: NOW.add(5, "hour").toDate(),
            })

            const { event } = await sut.execute({ data: eventData });

            expect(event.id).toEqual(expect.any(String));
            expect(event.startAt).toEqual(eventData.startAt);
        });
    });

    describe("Error cases", () => {
        it("should not be able to create an event with duplicated slug", async () => {
            const eventData = makeEvent({
                startAt: NOW.toDate(),
                endsAt: NOW.add(5, "hour").toDate(),
            })

            await sut.execute({ data: eventData });

            await expect(
                sut.execute({ data: eventData }),
            ).rejects.toBeInstanceOf(EventAlreadyExistsError);
        });

        it("should not be able to create an event with start date in the past", async () => {
            const eventData = makeEvent({
                startAt: NOW.subtract(1, "day").toDate(),
                endsAt: NOW.add(1, "day").toDate(),
            })

            await expect(
                sut.execute({ data: eventData }),
            ).rejects.toBeInstanceOf(EventStartDateInPastError);
        });

        it("should not be able to create an event that ends before it starts", async () => {
            const eventData = makeEvent({
                startAt: NOW.add(5, "day").toDate(),
                endsAt: NOW.subtract(5, "hour").toDate()
            })

            await expect(
                sut.execute({ data: eventData }),
            ).rejects.toBeInstanceOf(EventEndBeforeStartError);
        });

        it("should not allow end date equal to start date", async () => {
            await expect(
                sut.execute({
                    data: makeEvent({
                        startAt: NOW.toDate(),
                        endsAt: NOW.toDate()
                    })
                }),
            ).rejects.toBeInstanceOf(EventEndBeforeStartError);
        });
    });
});

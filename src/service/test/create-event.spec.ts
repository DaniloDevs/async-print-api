import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventAlreadyExistsError } from "../../_errors/event-already-exist-error";
import { EventEndBeforeStartError } from "../../_errors/event-end-before-start-error";
import { EventStartDateInPastError } from "../../_errors/event-start-date-in-past-error";
import type {
    EventsCreateInput,
    IEventsRepository,
} from "../../repository/events";
import { EventsInMemomryRepository } from "../../repository/in-memory/events-repo";
import { createSlug } from "../../utils/create-slug";
import { CreateEventService } from "../create-event";

describe("Create Event - Service", () => {
    let eventRepository: IEventsRepository;
    let sut: CreateEventService;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2025-01-01T10:00:00Z"));

        eventRepository = new EventsInMemomryRepository();
        sut = new CreateEventService(eventRepository);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should be able to create a new event", async () => {
        const eventData: EventsCreateInput = {
            title: "Evento Teste Loide Maxima",
            status: "draft",
            bannerKey: null,
            startAt: dayjs().add(7, "day").toDate(),
            endsAt: dayjs().add(7, "day").add(10, "hour").toDate(),
        };

        const event = await sut.execute(eventData);

        expect(event.id).toEqual(expect.any(String));
        expect(event.slug).toBe(createSlug(eventData.title));
        expect(event.startAt.getTime()).toBe(eventData.startAt.getTime());
    });

    it("should not be able to create an event with duplicated slug", async () => {
        const eventData: EventsCreateInput = {
            title: "Evento Duplicado",
            status: "draft",
            bannerKey: null,
            startAt: dayjs().add(5, "day").toDate(),
            endsAt: dayjs().add(5, "day").add(2, "hour").toDate(),
        };

        await sut.execute(eventData);

        await expect(
            Promise.all([sut.execute(eventData), sut.execute(eventData)]),
        ).rejects.toBeInstanceOf(EventAlreadyExistsError);
    });

    it("should not be able to create an event with start date in the past", async () => {
        const eventData: EventsCreateInput = {
            title: "Evento no Passado",
            status: "draft",
            bannerKey: null,
            startAt: dayjs().subtract(1, "day").toDate(),
            endsAt: dayjs().add(1, "day").toDate(),
        };

        await expect(sut.execute(eventData)).rejects.toBeInstanceOf(
            EventStartDateInPastError,
        );
    });

    it("should not be able to create an event that ends before it starts", async () => {
        const startDate = dayjs().add(5, "day");

        const eventData: EventsCreateInput = {
            title: "Evento com Data Final Inválida",
            status: "draft",
            bannerKey: null,
            startAt: startDate.toDate(),
            endsAt: startDate.subtract(2, "hour").toDate(), // termina ANTES de começar
        };

        await expect(sut.execute(eventData)).rejects.toBeInstanceOf(
            EventEndBeforeStartError,
        );
    });

    it("should not allow end date equal to start date", async () => {
        const start = dayjs().add(1, "day").toDate();

        await expect(
            sut.execute({
                title: "Evento inválido",
                status: "draft",
                bannerKey: null,
                startAt: start,
                endsAt: start,
            }),
        ).rejects.toBeInstanceOf(EventEndBeforeStartError);
    });

    it("should create event with end date exactly 1 minute after start", async () => {
        const startDate = dayjs().add(2, "day");

        const eventData: EventsCreateInput = {
            title: "Evento Curto Válido",
            status: "draft",
            bannerKey: null,
            startAt: startDate.toDate(),
            endsAt: startDate.add(1, "minute").toDate(),
        };

        const event = await sut.execute(eventData);

        expect(event.id).toEqual(expect.any(String));
        expect(dayjs(event.endsAt).isAfter(event.startAt)).toBe(true);
    });

    it("should create event starting exactly now", async () => {
        const now = dayjs("2025-01-01T10:00:00Z");

        const eventData: EventsCreateInput = {
            title: "Evento Começando Agora",
            status: "draft",
            bannerKey: null,
            startAt: now.toDate(),
            endsAt: now.add(2, "day").toDate(),
        };

        const event = await sut.execute(eventData);

        expect(event.id).toEqual(expect.any(String));
        expect(event.startAt).toEqual(eventData.startAt);
    });
});

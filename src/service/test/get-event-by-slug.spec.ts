import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type { IStorageProvider } from "../../provider/storage-provider";
import type { Event, IEventRepository } from "./../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { GetEventBySlugService } from "../get-event-by-slug";

describe("Get Event By Slug - Service", () => {
    let eventRepository: IEventRepository;
    let storageProvider: IStorageProvider;
    let service: GetEventBySlugService;

    let event: Event;

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(dayjs("2021-01-25").toDate());

        eventRepository = new EventInMemoryRepository();

        storageProvider = {
            upload: vi.fn(),
            getPublicUrl: vi.fn(),
        };

        service = new GetEventBySlugService(eventRepository, storageProvider);

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

    it("should be able to get an event by slug without banner", async () => {
        const { event: getEvent } = await service.execute({ slug: event.slug });

        expect(storageProvider.getPublicUrl).not.toHaveBeenCalled();
        expect(getEvent).toEqual({
            ...event,
            bannerUrl: null,
            bannerKey: null,
        });
    });

    it("should return resolved bannerUrl when event has bannerKey", async () => {
        const eventWithBanner = await eventRepository.create({
            title: "Event With Banner",
            bannerKey: "event-banner.png",
            status: "active",
            startAt: dayjs("2021-01-25").toDate(),
            endsAt: dayjs("2021-01-25").add(3, "day").toDate(),
        });

        vi.spyOn(storageProvider, "getPublicUrl").mockResolvedValue(
            "https://storage.example.com/event-banner.png",
        );

        const { event: getEvent } = await service.execute({
            slug: eventWithBanner.slug,
        });

        expect(storageProvider.getPublicUrl).toHaveBeenCalledTimes(1);
        expect(storageProvider.getPublicUrl).toHaveBeenCalledWith(
            "event-banner.png",
        );

        expect(getEvent).toEqual({
            ...eventWithBanner,
            bannerUrl: "https://storage.example.com/event-banner.png",
            bannerKey: "event-banner.png",
        });
    });

    it("should throw ResourceNotFoundError when event does not exist", async () => {
        await expect(
            service.execute({ slug: "non-existent-slug" }),
        ).rejects.instanceOf(ResourceNotFoundError);
    });
});

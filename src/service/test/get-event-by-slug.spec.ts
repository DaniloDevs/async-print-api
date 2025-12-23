import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type { IStorageProvider } from "../../provider/storage-provider";
import type { Events } from "../../repository/events";
import { EventsInMemomryRepository } from "../../repository/in-memory/events-repo";
import { GetEventBySlugService } from "../get-event-by-slug";

describe("Get Event By Slug - Service", () => {
    let eventRepository: EventsInMemomryRepository;
    let storageProvider: IStorageProvider;
    let service: GetEventBySlugService;

    let event: Events;

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(dayjs("2021-01-25").toDate());

        eventRepository = new EventsInMemomryRepository();

        storageProvider = {
            upload: vi.fn(),
            getPublicUrl: vi.fn(),
        };

        service = new GetEventBySlugService(eventRepository, storageProvider);

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

    it("should be able to get an event by slug without banner", async () => {
        const result = await service.execute(event.slug);

        expect(storageProvider.getPublicUrl).not.toHaveBeenCalled();
        expect(result).toEqual({
            ...event,
            bannerUrl: null,
            bannerKey: null,
        });
    });

    it("should return resolved bannerUrl when event has bannerKey", async () => {
        const eventWithBanner = await eventRepository.create({
            title: "Event With Banner",
            bannerKey: "event-banner.png",
            isActivated: true,
            startAt: dayjs("2021-01-25").toDate(),
            endsAt: dayjs("2021-01-25").add(3, "day").toDate(),
        });

        vi.spyOn(storageProvider, "getPublicUrl").mockResolvedValue(
            "https://storage.example.com/event-banner.png",
        );

        const result = await service.execute(eventWithBanner.slug);

        expect(storageProvider.getPublicUrl).toHaveBeenCalledTimes(1);
        expect(storageProvider.getPublicUrl).toHaveBeenCalledWith(
            "event-banner.png",
        );

        expect(result).toEqual({
            ...eventWithBanner,
            bannerUrl: "https://storage.example.com/event-banner.png",
            bannerKey: "event-banner.png",
        });
    });

    it("should throw ResourceNotFoundError when event does not exist", async () => {
        await expect(service.execute("non-existent-slug")).rejects.instanceOf(
            ResourceNotFoundError,
        );
    });
});

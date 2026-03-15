import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IStorageProvider } from "../../provider/storage-provider";
import type { IEventRepository } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { ResourceNotFoundError } from "../@errors/resource-not-found-error";
import { makeEvent } from "../@factory/_test/makeEvent";
import { GetEventService } from "./get-event";

describe("Get Event (Service)", () => {
    let eventRepository: IEventRepository;
    let storageProvider: IStorageProvider;
    let sut: GetEventService;

    const NOW = dayjs("2024-01-01T12:00:00Z");

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW.toDate());

        eventRepository = new EventInMemoryRepository();

        storageProvider = {
            upload: vi.fn(),
            getPublicUrl: vi.fn(),
        };

        sut = new GetEventService(eventRepository, storageProvider);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    describe("Successful cases", () => {
        it("should be possible to catch an event without banner key.", async () => {
            const eventMock = await eventRepository.create(
                makeEvent({
                    bannerKey: null,
                    startAt: NOW.toDate(),
                    endsAt: NOW.add(10, "hour").toDate(),
                }),
            );

            const { event } = await sut.execute({ slug: eventMock.slug });

            expect(storageProvider.getPublicUrl).not.toHaveBeenCalled();
            expect(event).toEqual({
                ...eventMock,
                bannerUrl: null,
            });
        });

        // it("should be possible to capture an event with bannerKey.", async () => {
        //     const eventMock = await eventRepository.create(
        //         makeEvent({
        //             startAt: dayjs().toDate(),
        //             endsAt: dayjs().add(10, "hour").toDate(),
        //         }),
        //     );

        //     vi.spyOn(storageProvider, "getPublicUrl").mockResolvedValue(
        //         "https://storage.example.com/event-banner.png",
        //     );

        //     const { event } = await sut.execute({
        //         slug: eventMock.slug,
        //     });

        //     expect(storageProvider.getPublicUrl).toHaveBeenCalledTimes(1);
        //     expect(storageProvider.getPublicUrl).toHaveBeenCalledWith(
        //          "event-banner.png",
        //     );

        //     expect(event).toEqual({
        //         ...eventMock,
        //     });
        // });
    });

    describe("Error cases", () => {
        it("hould not be possible to catch an event that does not exist.", async () => {
            await expect(
                sut.execute({ slug: "non-existent-slug" }),
            ).rejects.instanceOf(ResourceNotFoundError);
        });
    });
});

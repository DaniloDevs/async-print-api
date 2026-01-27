import crypto from "node:crypto";
import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InvalidFileTypeError } from "../../_errors/invalid-file-type-error";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type { IStorageProvider } from "../../provider/storage-provider";
import type { Event } from "./../../repository/event";
import type { IEventRepository } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { UpdateBannerService } from "../update-banner";

describe("Update Banner - Service", () => {
    let eventRepository: IEventRepository;
    let storageProvider: IStorageProvider;
    let service: UpdateBannerService;

    let Event: Event;

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(dayjs("2021-01-25").toDate());

        eventRepository = new EventInMemoryRepository();

        storageProvider = {
            upload: vi.fn(),
            getPublicUrl: vi.fn(),
        };

        service = new UpdateBannerService(eventRepository, storageProvider);

        Event = await eventRepository.create({
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

    const file = {
        buffer: Buffer.from("fake-image"),
        filename: "banner.png",
        mimetype: "image/png",
    };

    it("should be possible to update the banner for a lengthy event.", async () => {
        const event = await eventRepository.findById(Event.id);

        vi.spyOn(storageProvider, "upload").mockResolvedValue(
            "stored-banner.png",
        );

        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "123e4567-e89b-12d3-a456-426614174000",
        );

        await service.execute({
            eventId: event?.id as string,
            file,
        });

        const updatedEvent = await eventRepository.findById(
            event?.id as string,
        );

        expect(storageProvider.upload).toHaveBeenCalledWith({
            file: file.buffer,
            filename: "event-test.png",
            contentType: "image/png",
        });

        expect(updatedEvent?.bannerKey).toBe("stored-banner.png");
    });

    it("It should be possible to preserve the original file extension.", async () => {
        const event = await eventRepository.findById(Event.id);

        vi.spyOn(storageProvider, "upload").mockResolvedValue(
            "stored-banner.jpeg",
        );

        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "123e4567-e89b-12d3-a456-426614174000",
        );

        await service.execute({
            eventId: event?.id as string,
            file: {
                ...file,
                filename: "photo.jpeg",
                mimetype: "image/jpeg",
            },
        });

        expect(storageProvider.upload).toHaveBeenCalledWith(
            expect.objectContaining({
                filename: "event-test.jpeg",
            }),
        );
    });

    it("It should not be possible to update the banner with an invalid image.", async () => {
        const event = await eventRepository.findById(Event.id);

        await expect(
            service.execute({
                eventId: event?.id as string,
                file: {
                    ...file,
                    mimetype: "application/pdf",
                },
            }),
        ).rejects.toBeInstanceOf(InvalidFileTypeError);
    });

    it("It should not be possible to update the banner of an event that does not exist.", async () => {
        await expect(
            service.execute({
                eventId: "event-inexistente",
                file,
            }),
        ).rejects.toBeInstanceOf(ResourceNotFoundError);
    });
});

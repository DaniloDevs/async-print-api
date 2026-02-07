import crypto from "node:crypto";
import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventAlreadyEndedError } from "../../_errors/event-already-ended-error";
import { EventNotStartedYetError } from "../../_errors/event-not-started-yet-error";
import { InvalidFileTypeError } from "../../_errors/invalid-file-type-error";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type { IStorageProvider } from "../../provider/storage-provider";
import type { Event } from "./../../repository/event";
import type { IEventRepository } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { UpdateEventBannerService } from "../update-event-banner";
import { makeEvent } from "./factorey/makeEvent";

describe("Update event Banner (Service)", () => {
    let eventRepository: IEventRepository;
    let storageProvider: IStorageProvider;
    let sut: UpdateEventBannerService;
    let Event: Event;

    const NOW = dayjs("2024-01-01T12:00:00Z");

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW.toDate());
        eventRepository = new EventInMemoryRepository();

        storageProvider = {
            upload: vi.fn(),
            getPublicUrl: vi.fn(),
        };

        sut = new UpdateEventBannerService(eventRepository, storageProvider);

        Event = await eventRepository.create(
            makeEvent({
                startAt: NOW.add(1, "hour").toDate(),
                endsAt: NOW.add(11, "hour").toDate(),
            }),
        );
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    describe("Successful cases", () => {
        it("should be possible to update the banner for a lengthy event.", async () => {
            const event = await eventRepository.findById(Event.id);

            vi.spyOn(storageProvider, "upload").mockResolvedValue(
                "stored-banner.png",
            );

            vi.spyOn(crypto, "randomUUID").mockReturnValue(
                "123e4567-e89b-12d3-a456-426614174000",
            );

            const file = {
                buffer: Buffer.from("fake-image"),
                filename: "banner.png",
                mimetype: "image/png",
            };

            await sut.execute({
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

            const file = {
                buffer: Buffer.from("fake-image"),
                filename: "banner.png",
                mimetype: "image/png",
            };

            await sut.execute({
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
    });

    describe("Error cases", () => {
        it("It should not be possible to update the banner with an invalid image.", async () => {
            const event = await eventRepository.findById(Event.id);

            const file = {
                buffer: Buffer.from("fake-image"),
                filename: "banner.png",
                mimetype: "image/png",
            };

            await expect(
                sut.execute({
                    eventId: event?.id as string,
                    file: {
                        ...file,
                        mimetype: "application/pdf",
                    },
                }),
            ).rejects.toBeInstanceOf(InvalidFileTypeError);
        });

        it("It should not be possible to update the banner of an event that does not exist.", async () => {
            const file = {
                buffer: Buffer.from("fake-image"),
                filename: "banner.png",
                mimetype: "image/png",
            };

            await expect(
                sut.execute({
                    eventId: "event-inexistente",
                    file,
                }),
            ).rejects.toBeInstanceOf(ResourceNotFoundError);
        });

        it("It should not be possible to update the banner of a finished event.", async () => {
            const finishedEvent = await eventRepository.create(
                makeEvent({
                    startAt: NOW.subtract(2, "hour").toDate(),
                    endsAt: NOW.subtract(1, "hour").toDate(),
                    status: "finished",
                }),
            );

            const file = {
                buffer: Buffer.from("fake-image"),
                filename: "banner.png",
                mimetype: "image/png",
            };

            await expect(
                sut.execute({
                    eventId: finishedEvent.id,
                    file,
                }),
            ).rejects.toBeInstanceOf(EventAlreadyEndedError);
        });

        it("It should not be possible to update the banner of a canceled event.", async () => {
            const canceledEvent = await eventRepository.create(
                makeEvent({
                    startAt: NOW.add(5, "hour").toDate(),
                    endsAt: NOW.add(10, "hour").toDate(),
                    status: "canceled",
                }),
            );

            const file = {
                buffer: Buffer.from("fake-image"),
                filename: "banner.png",
                mimetype: "image/png",
            };

            await expect(
                sut.execute({
                    eventId: canceledEvent.id,
                    file,
                }),
            ).rejects.toBeInstanceOf(EventAlreadyEndedError);
        });

        it("It should not be possible to update the banner when the event has already started.", async () => {
            const runningEvent = await eventRepository.create(
                makeEvent({
                    startAt: NOW.subtract(1, "hour").toDate(),
                    endsAt: NOW.add(5, "hour").toDate(),
                    status: "active",
                }),
            );

            const file = {
                buffer: Buffer.from("fake-image"),
                filename: "banner.png",
                mimetype: "image/png",
            };

            await expect(
                sut.execute({
                    eventId: runningEvent.id,
                    file,
                }),
            ).rejects.toBeInstanceOf(EventNotStartedYetError);
        });

        it("It should not be possible to update the banner at the exact moment the event starts.", async () => {
            const startingEvent = await eventRepository.create(
                makeEvent({
                    startAt: NOW.toDate(),
                    endsAt: NOW.add(10, "hour").toDate(),
                    status: "active",
                }),
            );

            const file = {
                buffer: Buffer.from("fake-image"),
                filename: "banner.png",
                mimetype: "image/png",
            };

            await expect(
                sut.execute({
                    eventId: startingEvent.id,
                    file,
                }),
            ).rejects.toBeInstanceOf(EventNotStartedYetError);
        });
    });
});

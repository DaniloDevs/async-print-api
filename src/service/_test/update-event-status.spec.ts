import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EventStatus, IEventRepository } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { InvalidEventStatusTransitionError } from "../_errors/invalid-event-status-transitions-error";
import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import { makeEvent } from "../_factory/_test/makeEvent";
import { UpdateEventStatusService } from "../event/update-event-status";

describe("Update Event Status (Service)", () => {
    let eventRepository: IEventRepository;
    let sut: UpdateEventStatusService;
    let eventId: string;

    const NOW = dayjs("2024-01-01T12:00:00Z");

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW.toDate());

        eventRepository = new EventInMemoryRepository();
        sut = new UpdateEventStatusService(eventRepository);

        const event = await eventRepository.create(
            makeEvent({
                title: "Evento Teste",
                status: "DRAFT",
                startAt: NOW.toDate(),
                endsAt: NOW.add(10, "hour").toDate(),
            }),
        );

        eventId = event.id;
    });

    afterEach(() => {
        vi.useRealTimers();
    });
    describe("Successful cases", () => {
        describe("valid status transitions", () => {
            it.each<[from: EventStatus, to: EventStatus]>([
                ["DRAFT", "ACTIVE"],
                ["DRAFT", "CANCELED"],

                ["ACTIVE", "FINISHED"],
                ["ACTIVE", "CANCELED"],
                ["ACTIVE", "INACTIVE"],

                ["INACTIVE", "ACTIVE"],
                ["INACTIVE", "FINISHED"],
                ["INACTIVE", "CANCELED"],

                ["FINISHED", "CANCELED"],
            ])("should allow %s → %s", async (from, to) => {
                if (from !== "DRAFT") {
                    await eventRepository.forceStatus(eventId, from);
                }

                const { event } = await sut.execute({
                    eventId: eventId,
                    newStatus: to,
                });

                expect(event.status).toBe(to);

                const persisted = await eventRepository.findById(eventId);
                expect(persisted?.status).toBe(to);
            });
        });
    });

    describe("error cases", () => {
        it.each<[from: EventStatus, to: EventStatus]>([
            ["DRAFT", "INACTIVE"],
            ["DRAFT", "FINISHED"],

            ["ACTIVE", "DRAFT"],

            ["INACTIVE", "DRAFT"],

            ["FINISHED", "DRAFT"],
            ["FINISHED", "ACTIVE"],
            ["FINISHED", "INACTIVE"],

            ["CANCELED", "DRAFT"],
            ["CANCELED", "ACTIVE"],
            ["CANCELED", "INACTIVE"],
            ["CANCELED", "FINISHED"],
        ])("should NOT allow %s → %s", async (from, to) => {
            if (from !== "DRAFT") {
                await eventRepository.forceStatus(eventId, from);
            }

            await expect(
                sut.execute({ eventId: eventId, newStatus: to }),
            ).rejects.toBeInstanceOf(InvalidEventStatusTransitionError);
        });

        it("should throw ResourceNotFoundError if event does not exist", async () => {
            await expect(
                sut.execute({
                    eventId: "non-existent-id",
                    newStatus: "ACTIVE",
                }),
            ).rejects.toBeInstanceOf(ResourceNotFoundError);
        });

        it("should not allow idempotent transition (same status)", async () => {
            await sut.execute({ eventId: eventId, newStatus: "ACTIVE" });

            await expect(
                sut.execute({ eventId: eventId, newStatus: "ACTIVE" }),
            ).rejects.toBeInstanceOf(InvalidEventStatusTransitionError);
        });
    });
});

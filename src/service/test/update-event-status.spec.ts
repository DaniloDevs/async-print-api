import dayjs from "dayjs";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { EventsInMemomryRepository } from "../../repository/in-memory/events-repo";
import { UpdateEventStatusService } from "../update-event-status";
import { EventsStatus } from "../../repository/events";
import { InvalidEventStatusTransitionError } from "../../_errors/invalid-event-status-transitions-error";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";



describe("UpdateEventStatusService", () => {
    let eventRepository: EventsInMemomryRepository;
    let sut: UpdateEventStatusService;
    let eventId: string;

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(dayjs("2025-01-01T10:00:00Z").toDate());

        eventRepository = new EventsInMemomryRepository();
        sut = new UpdateEventStatusService(eventRepository);

        const event = await eventRepository.create({
            title: "Evento Teste",
            status: "draft",
            bannerKey: null,
            startAt: dayjs().add(7, "day").toDate(),
            endsAt: dayjs().add(7, "day").add(10, "hour").toDate(),
        });

        eventId = event.id;
    });

    afterEach(() => {
        vi.useRealTimers();
    });


    describe("valid status transitions", () => {
        it.each<
            [from: EventsStatus, to: EventsStatus]
        >([
            ["draft", "active"],
            ["draft", "canceled"],

            ["active", "finished"],
            ["active", "canceled"],
            ["active", "inactive"],

            ["inactive", "active"],
            ["inactive", "finished"],
            ["inactive", "canceled"],

            ["finished", "canceled"],
        ])("should allow %s → %s", async (from, to) => {
            if (from !== "draft") {
                await eventRepository.forceStatus(eventId, from);
            }

            const updatedEvent = await sut.execute(eventId, to);

            expect(updatedEvent.status).toBe(to);

            const persisted = await eventRepository.findById(eventId);
            expect(persisted?.status).toBe(to);
        });
    });

    describe("invalid status transitions", () => {
        it.each<
            [from: EventsStatus, to: EventsStatus]
        >([
            ["draft", "inactive"],
            ["draft", "finished"],

            ["active", "draft"],

            ["inactive", "draft"],

            ["finished", "draft"],
            ["finished", "active"],
            ["finished", "inactive"],

            ["canceled", "draft"],
            ["canceled", "active"],
            ["canceled", "inactive"],
            ["canceled", "finished"],
        ])("should NOT allow %s → %s", async (from, to) => {
            if (from !== "draft") {
                await eventRepository.forceStatus(eventId, from);
            }
            
            await expect(
                sut.execute(eventId, to)
            ).rejects.toBeInstanceOf(InvalidEventStatusTransitionError);
        });
    });



    describe("error cases", () => {
        it("should throw ResourceNotFoundError if event does not exist", async () => {
            await expect(
                sut.execute("non-existent-id", "active")
            ).rejects.toBeInstanceOf(ResourceNotFoundError);
        });

        it("should not allow idempotent transition (same status)", async () => {
            await sut.execute(eventId, "active");

            await expect(
                sut.execute(eventId, "active")
            ).rejects.toBeInstanceOf(InvalidEventStatusTransitionError);
        });
    });
});

import dayjs from "dayjs";
import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type { Event, IEventRepository } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { PrinterInMemoryRepository } from "../../repository/in-memory/printer-repo";
import { ListPrinterLeadsService } from "../list-event-printers";
import { makeEvent } from "./factorey/makeEvent";
import { makePrinter } from "./factorey/makePrinter";

describe("List event printers (Service)", () => {
    let sut: ListPrinterLeadsService;
    let eventRepository: IEventRepository;
    let printersRepository: PrinterInMemoryRepository;
    let event: Event;

    const NOW = dayjs("2024-01-01T12:00:00Z");

    beforeEach(async () => {
        eventRepository = new EventInMemoryRepository();
        printersRepository = new PrinterInMemoryRepository();

        sut = new ListPrinterLeadsService(printersRepository, eventRepository);

        event = await eventRepository.create(
            makeEvent({
                startAt: NOW.toDate(),
                endsAt: NOW.add(10, "hour").toDate(),
            }),
        );
    });

    describe("Successful cases", () => {
        it("should be possible to list printers from an event.", async () => {
            const printersCount = 4;

            for (let i = 0; i < printersCount; i++) {
                await printersRepository.create(
                    makePrinter({
                        name: `Printer ${i}`,
                        path: `/dev/usb/lp${i}`,
                        type: "network",
                        status: "connected",
                        eventId: event.id,
                    }),
                );
            }

            const { printers, totalPrinter } = await sut.execute({
                eventId: event.id,
            });

            expect(totalPrinter).toBe(printersCount);
            expect(printers).toHaveLength(printersCount);
            expect(printers.every((p) => p.eventId === event.id)).toBe(true);
        });

        it("It should be possible to display an empty list when there are no printers.", async () => {
            const { printers, totalPrinter } = await sut.execute({
                eventId: event.id,
            });

            expect(totalPrinter).toBe(0);
            expect(printers).toEqual([]);
        });
    });

    describe("Error cases", () => {
        it("should not be possible to list printers for an event that does not exist", async () => {
            await expect(
                sut.execute({ eventId: "non-existent-id" }),
            ).rejects.toBeInstanceOf(ResourceNotFoundError);
        });
    });
});

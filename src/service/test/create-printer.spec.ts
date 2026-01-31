import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PrinterAlreadyExistsError } from "../../_errors/printer-already-exist-error";
import type { IPrinterProvider } from "../../provider/Printer-provider";
import type { IEventRepository } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { PrinterInMemoryRepository } from "../../repository/in-memory/printer-repo";
import { generateSlug } from "../../utils/generate-slug";
import { CreatePrinterService } from "../create-printer";
import { makeEvent } from "./factorey/makeEvent";
import { makePrinter } from "./factorey/makePrinter";

describe("Create Printer (Service)", () => {
    let printerRepository: PrinterInMemoryRepository;
    let eventRepository: IEventRepository;
    let printerProvider: IPrinterProvider & { isAvailable: any };
    let sut: CreatePrinterService;

    const NOW = dayjs("2024-01-01T12:00:00Z");
    const eventInput = makeEvent();

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW.toDate());

        printerRepository = new PrinterInMemoryRepository();
        eventRepository = new EventInMemoryRepository();
        printerProvider = {
            isAvailable: vi.fn(),
        } as unknown as IPrinterProvider & { isAvailable: any };

        sut = new CreatePrinterService(printerRepository, printerProvider);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.resetAllMocks();
    });

    describe("Successful cases", () => {
        it("should create a new printer with status 'connected' when available", async () => {
            const event = await eventRepository.create(eventInput);
            const printerData = makePrinter({
                status: "connected",
                eventId: event.id,
            });

            printerProvider.isAvailable.mockResolvedValue(true);

            const { printer } = await sut.execute({ data: printerData });

            expect(printer.id).toEqual(expect.any(String));
            expect(printer.slug).toBe(generateSlug(printerData.name));
            expect(printer.status).toBe("connected");
            expect(printer.createdAt).toEqual(NOW.toDate());
            expect(printerProvider.isAvailable).toHaveBeenCalledWith(
                printerData.path,
            );
            expect(printer.description).toBe(printerData.description);
        });

        it("should create a new printer with status 'disconnected' when not available", async () => {
            const event = await eventRepository.create(eventInput);
            const printerData = makePrinter({
                status: "disconnected",
                eventId: event.id,
            });

            printerProvider.isAvailable.mockResolvedValue(false);

            const { printer } = await sut.execute({ data: printerData });

            expect(printer.id).toEqual(expect.any(String));
            expect(printer.slug).toBe(generateSlug(printerData.name));
            expect(printer.status).toBe("disconnected");
            expect(printerProvider.isAvailable).toHaveBeenCalledWith(
                printerData.path,
            );
        });

        it("should generate a slug removing accents and special characters", async () => {
            const event = await eventRepository.create(eventInput);
            const printerData = makePrinter({
                name: "Impressõra Áccênt",
                eventId: event.id,
            });

            printerProvider.isAvailable.mockResolvedValue(true);

            const { printer } = await sut.execute({ data: printerData });

            expect(printer.slug).toBe(generateSlug(printerData.name));
        });
    });

    describe("Error cases", () => {
        it("should not allow creating a printer with duplicated slug", async () => {
            const event = await eventRepository.create(eventInput);
            const printerData = makePrinter({
                name: "Error case",
                eventId: event.id,
            });

            printerProvider.isAvailable.mockResolvedValue(true);

            await sut.execute({ data: printerData });

            await expect(
                sut.execute({ data: printerData }),
            ).rejects.toBeInstanceOf(PrinterAlreadyExistsError);
        });
    });
});

import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PrinterAlreadyExistsError } from "../../_errors/printer-already-exist-error";
import type { IPrinterProvider } from "../../provider/Printer-provider";
import { PrinterInMemoryRepository } from "../../repository/in-memory/printer-repo";
import type { PrinterCreateInput } from "../../repository/printer";
import { generateSlug } from "../../utils/generate-slug";
import { CreatePrinterService } from "../create-printer";

describe("Create Printer (Service)", () => {
    let printerRepository: PrinterInMemoryRepository;
    let printerProvider: IPrinterProvider & { isAvailable: any };
    let sut: CreatePrinterService;

    const NOW = dayjs("2024-01-01T12:00:00Z");

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW.toDate());

        printerRepository = new PrinterInMemoryRepository();
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
            const printerData: PrinterCreateInput = {
                name: "Impressora Principal",
                path: "/dev/usb/lp0",
                type: "network",
                description: "Impressora da recepção",
                status: "connected",
            };

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
            const printerData: PrinterCreateInput = {
                name: "Impressora Backup",
                path: "/dev/usb/lp1",
                type: "thermal",
                status: "disconnected",
            };

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
            const printerData: PrinterCreateInput = {
                name: "Impressõra Áccênt",
                path: "/dev/usb/lp2",
                type: "laser",
                status: "connected",
            };

            printerProvider.isAvailable.mockResolvedValue(true);

            const { printer } = await sut.execute({ data: printerData });

            expect(printer.slug).toBe(generateSlug(printerData.name));
        });
    });

    describe("Error cases", () => {
        it("should not allow creating a printer with duplicated slug", async () => {
            const printerData: PrinterCreateInput = {
                name: "Duplicada",
                path: "/dev/usb/lp3",
                type: "pdf",
                status: "disconnected",
            };

            printerProvider.isAvailable.mockResolvedValue(true);

            await sut.execute({ data: printerData });

            await expect(
                sut.execute({ data: printerData }),
            ).rejects.toBeInstanceOf(PrinterAlreadyExistsError);
        });
    });
});

import { prisma } from "../../../lib/prisma";
import { LocalPrinterProvider } from "../../../provider/local-printer-provider";
import { PrinterPrismaRepository } from "../../../repository/prisma/printer";
import { CreatePrinterService } from "../../printers/create-printer";

export function makeCreatePrinter() {
    const printerRepository = new PrinterPrismaRepository(prisma);
    const printerProvider = new LocalPrinterProvider();
    const service = new CreatePrinterService(
        printerRepository,
        printerProvider,
    );

    return service;
}

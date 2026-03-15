import { prisma } from "../../../lib/prisma";
import { EventPrismaRepository } from "../../../repository/prisma/event";
import { PrinterPrismaRepository } from "../../../repository/prisma/printer";
import { ListPrinterLeadsService } from "../../printers/list-event-printers";

export function makeListEventPrinters() {
    const printerRepository = new PrinterPrismaRepository(prisma);
    const eventRepository = new EventPrismaRepository(prisma);
    const service = new ListPrinterLeadsService(
        printerRepository,
        eventRepository,
    );

    return service;
}

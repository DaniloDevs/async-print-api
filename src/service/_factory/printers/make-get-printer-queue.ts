import { prisma } from "../../../lib/prisma";
import { JobPrismaRepository } from "../../../repository/prisma/job";
import { PrinterPrismaRepository } from "../../../repository/prisma/printer";
import { GetPrinterQueue } from "../../printers/get-printer-queue";

export function makeGetPrinterQueue() {
    const printerRepository = new PrinterPrismaRepository(prisma);
    const jobRepository = new JobPrismaRepository(prisma);
    const service = new GetPrinterQueue(printerRepository, jobRepository);

    return service;
}

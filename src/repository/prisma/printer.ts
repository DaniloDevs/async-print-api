import { PrismaClient } from "../../../prisma/generated/prisma";
import { IPrinterRepository, Printer, PrinterCreateInput } from "../printer";

export class PrinterPrismaRepository implements IPrinterRepository {
    constructor(private prisma: PrismaClient) {}

    async create(data: PrinterCreateInput): Promise<Printer> {
        const printer = await this.prisma.printer.create({
            data: {
                ...data,
                status: data.status.toUpperCase() as any,
                type: data.type.toUpperCase() as any,
            },
        });
        return printer as unknown as Printer;
    }

    async findBySlug(slug: string): Promise<Printer | null> {
        const printer = await this.prisma.printer.findFirst({
            where: { slug },
        });
        return printer as unknown as Printer | null;
    }

    async fidnByIdAndEventId(id: string, eventId: string): Promise<Printer | null> {
        const printer = await this.prisma.printer.findFirst({
            where: { id, eventId },
        });
        return printer as unknown as Printer | null;
    }

    async findManyByEventId(eventId: string): Promise<Printer[]> {
        const printers = await this.prisma.printer.findMany({
            where: { eventId },
        });
        return printers as unknown as Printer[];
    }
}

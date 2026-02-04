import { generateSlug } from "../../utils/generate-slug";
import type {
    IPrinterRepository,
    Printer,
    PrinterCreateInput,
} from "../printer";

export class PrinterInMemoryRepository implements IPrinterRepository {
    public items: Printer[] = [];

    async create(data: PrinterCreateInput): Promise<Printer> {
        const printer: Printer = {
            id: crypto.randomUUID(),
            createdAt: new Date(),
            name: data.name,
            slug: generateSlug(data.name),
            path: data.path,
            status: data.status,
            type: data.type,
            description: data.description ?? undefined,
            eventId: data.eventId,
        };

        this.items.push(printer);

        return printer;
    }

    async findBySlug(slug: string): Promise<Printer | null> {
        const printer = this.items.find((item) => item.slug === slug);
        return printer || null;
    }

    async findManyByEventId(eventId: string): Promise<Printer[]> {
        const leads = this.items.filter((item) => item.eventId === eventId);

        return leads;
    }

    async fidnByIdAndEventId(id: string, eventId: string): Promise<Printer | null> {
        const printer = this.items.find((item) => item.id === id && item.eventId === eventId);
        return printer || null;
    }
}

import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import type { IEventRepository } from "../repository/event";
import type { IPrinterRepository, Printer } from "../repository/printer";

interface RequestDate {
    eventId: string;
}

interface ResponseDate {
    totalPrinter: number;
    printers: Printer[];
}

export class ListPrinterLeadsService {
    constructor(
        private printerRepository: IPrinterRepository,
        private eventRepository: IEventRepository,
    ) {}

    async execute({ eventId }: RequestDate): Promise<ResponseDate> {
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new ResourceNotFoundError({
                resourceType: "Event",
                resource: eventId,
            });
        }

        const printers =
            await this.printerRepository.findManyByEventId(eventId);

        return {
            totalPrinter: printers.length,
            printers,
        };
    }
}

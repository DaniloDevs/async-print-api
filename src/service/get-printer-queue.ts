import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import type { IJobRepository, Job } from "../repository/job";
import type { IPrinterRepository } from "../repository/printer";

interface RequestDate {
    printerId: string;
    eventId: string;
}
interface ResponseDate {
    jobs: Job[];
}

export class GetPrinterQueue {
    constructor(
        private printerRepository: IPrinterRepository,
        private jobsRepository: IJobRepository,
    ) {}

    async execute({ printerId, eventId }: RequestDate): Promise<ResponseDate> {
        const printer = await this.printerRepository.fidnByIdAndEventId(
            printerId,
            eventId,
        );
        if (!printer) {
            throw new ResourceNotFoundError({
                resourceType: "Printer",
                resource: printerId,
            });
        }

        const jobs =
            await this.jobsRepository.findPendingByPrinterId(printerId);

        return { jobs };
    }
}

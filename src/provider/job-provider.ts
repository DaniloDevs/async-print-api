import { type PrintJobPayload, printQueue } from "../lib/queue";

export interface IJobProvider {
    enqueue(data: PrintJobPayload): Promise<void>;
}

export class BullMQJobProvider implements IJobProvider {
    async enqueue(data: PrintJobPayload): Promise<void> {
        await printQueue.add("print", data);
    }
}

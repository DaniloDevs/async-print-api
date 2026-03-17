import { Queue } from "bullmq";
import { redis } from "./redis";

export interface PrintJobPayload {
    jobId: string;
    leadId: string;
    name: string;
    phone: string;
    // Add printerId when queue support partitioned printers
    // printerId?: string;
}

export const printQueue = new Queue<PrintJobPayload, any, "print">(
    "print-queue",
    {
        connection: redis as any,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000,
            },
            removeOnComplete: true, // we already store completion in Postgres
            removeOnFail: false,
        },
    },
);

import z from "zod";

const JobStatus = z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]);

const job = z.object({
    id: z.string(),
    name: z.string(),
    payload: z.any(),
    status: JobStatus,
    createdAt: z.date(),
    attempts: z.number(),
    maxAttempts: z.number(),

    processedAt: z.date().nullable(),
    completedAt: z.date().nullable(),
    error: z.string().nullable(),
});

const jobCreateInput = job.omit({
    id: true,
    status: true,
    attempts: true,
    createdAt: true,
    processedAt: true,
    completedAt: true,
    error: true,
});

export type Job = z.infer<typeof job>;
export type JobCreateInput = z.infer<typeof jobCreateInput>;
export type JobStatusEnum = z.infer<typeof JobStatus>;

export interface IJobRepository {
    create(data: JobCreateInput): Promise<Job>;
    findPendingByPrinterId(printerId: string): Promise<Job[]>;
    markAsProcessing(jobId: string): Promise<void>;
    markAsCompleted(jobId: string): Promise<void>;
    markAsFailed(jobId: string, error: string): Promise<void>;
    incrementAttempts(jobId: string): Promise<void>;
}

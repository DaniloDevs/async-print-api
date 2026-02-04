import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { IJobRepository, Job, JobCreateInput } from "../job";

dayjs.extend(utc);

export class JobInMemoryRepository implements IJobRepository {
    public items: Job[] = [];

    async create(data: JobCreateInput): Promise<Job> {
        const job: Job = {
            id: crypto.randomUUID(),
            name: data.name,
            payload: data.payload,
            status: "PENDING",
            createdAt: dayjs().utc().toDate() as unknown as Date,
            attempts: 0,
            maxAttempts: data.maxAttempts ?? 3,
            processedAt: null,
            completedAt: null,
            error: null,
        };

        this.items.push(job);

        return job;
    }

    async findPendingByPrinterId(printerId: string): Promise<Job[]> {
        const jobs = this.items
            .filter(
                (item) =>
                    item.status === "PENDING" &&
                    item.payload?.printerId === printerId,
            )
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        return jobs;
    }

    async markAsProcessing(jobId: string): Promise<void> {
        const job = this.items.find((j) => j.id === jobId);
        if (!job) return;

        job.status = "PROCESSING";
        job.processedAt = dayjs().utc().toDate();
    }

    async markAsCompleted(jobId: string): Promise<void> {
        const job = this.items.find((j) => j.id === jobId);
        if (!job) return;

        job.status = "COMPLETED";
        job.completedAt = dayjs().utc().toDate();
    }

    async markAsFailed(jobId: string, error: string): Promise<void> {
        const job = this.items.find((j) => j.id === jobId);
        if (!job) return;

        job.status = "FAILED";
        job.error = error;
        job.completedAt = dayjs().utc().toDate();
    }

    async incrementAttempts(jobId: string): Promise<void> {
        const job = this.items.find((j) => j.id === jobId);
        if (!job) return;

        job.attempts = (job.attempts ?? 0) + 1;
    }
}

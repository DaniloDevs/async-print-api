import type { PrismaClient } from "../../../prisma/generated/prisma";
import type { IJobRepository, Job, JobCreateInput } from "../job";

export class JobPrismaRepository implements IJobRepository {
    constructor(private prisma: PrismaClient) {}

    async create(data: JobCreateInput): Promise<Job> {
        return this.prisma.job.create({
            data: {
                name: data.name,
                payload: data.payload,
                maxAttempts: data.maxAttempts,
                status: "PENDING",
            },
        });
    }

    async findManyPending(limit = 10): Promise<Job[]> {
        return this.prisma.$transaction(async (tx) => {
            const jobs = await tx.job.findMany({
                where: {
                    status: "PENDING",
                    attempts: {
                        lt: tx.job.fields.maxAttempts,
                    },
                },
                orderBy: {
                    createdAt: "asc",
                },
                take: limit,
            });

            if (jobs.length === 0) return [];

            const ids = jobs.map((j) => j.id);

            await tx.job.updateMany({
                where: {
                    id: { in: ids },
                },
                data: {
                    status: "PROCESSING",
                    processedAt: new Date(),
                },
            });

            return jobs;
        });
    }



    async findPendingByPrinterId(printerId: string) {
        const limit = 10
        
        return this.prisma.$transaction(async (tx) => {
            const jobs = await tx.job.findMany({
                where: {
                    status: "PENDING",
                    attempts: {
                        lt: tx.job.fields.maxAttempts,
                    },
                },
                orderBy: {
                    createdAt: "asc",
                },
                take: limit,
            });

            if (jobs.length === 0) return [];

            const ids = jobs.map((j) => j.id);

            await tx.job.updateMany({
                where: {
                    id: { in: ids },
                },
                data: {
                    status: "PROCESSING",
                    processedAt: new Date(),
                },
            });

            return jobs;
        });
    }

    async markAsProcessing(jobId: string): Promise<void> {
        await this.prisma.job.update({
            where: { id: jobId },
            data: {
                status: "PROCESSING",
                processedAt: new Date(),
            },
        });
    }

    async markAsCompleted(jobId: string): Promise<void> {
        await this.prisma.job.update({
            where: { id: jobId },
            data: {
                status: "COMPLETED",
                completedAt: new Date(),
                error: null,
            },
        });
    }

    async markAsFailed(jobId: string, error: string): Promise<void> {
        await this.prisma.job.update({
            where: { id: jobId },
            data: {
                status: "FAILED",
                error,
            },
        });
    }

    async incrementAttempts(jobId: string): Promise<void> {
        await this.prisma.job.update({
            where: { id: jobId },
            data: {
                attempts: {
                    increment: 1,
                },
            },
        });
    }
}

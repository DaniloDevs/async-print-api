import { prisma } from "./lib/prisma";
import { JobPrismaRepository } from "./repository/prisma/job";

async function startWorker() {
    console.log("Worker iniciado...");

    const printJobRepository = new JobPrismaRepository(prisma);

    setInterval(async () => {
        const jobs = await printJobRepository.findManyPending();

        for (const job of jobs) {
            try {
                // await print(job)
                await printJobRepository.markAsCompleted(job.id);
                console.log(`Job ${job.id} impresso`);
            } catch (_err) {
                await printJobRepository.incrementAttempts(job.id);
                console.error(`Erro no job ${job.id}`);
            }
        }
    }, 2000);
}

startWorker();

import { type Job, Worker } from "bullmq";
import { prisma } from "./lib/prisma";
import type { PrintJobPayload } from "./lib/queue";
import { redis } from "./lib/redis";
import { JobPrismaRepository } from "./repository/prisma/job";

async function startWorker() {
    console.log("Worker (BullMQ) iniciado e aguardando jobs...");

    const printJobRepository = new JobPrismaRepository(prisma);

    const worker = new Worker<PrintJobPayload, void, "print">(
        "print-queue",
        async (job: Job<PrintJobPayload, void, "print">) => {
            const { jobId, name } = job.data;

            // Espelha estado no Postgres
            await printJobRepository.markAsProcessing(jobId);

            try {
                console.log(
                    `[Worker] Iniciando impressão para: ${name} (Job: ${jobId})`,
                );

                // --- AQUI ENTRA A INTEGRAÇÃO COM A BIBLIOTECA DA IMPRESSORA ---
                // Simulação de impressora processando
                await new Promise((resolve) => setTimeout(resolve, 1000));

                // Exemplo simulando falha 20% das vezes:
                // if (Math.random() > 0.8) throw new Error("Falha na porta TCP da impressora");

                // --- SUCESSO ---
                await printJobRepository.markAsCompleted(jobId);
                console.log(
                    `[Worker] Impressão finalizada com sucesso! (Job: ${jobId})`,
                );
            } catch (err: any) {
                // Rethrow the error so BullMQ knows it failed and triggers retry & backoff
                console.error(
                    `[Worker] Erro local na impressão (Job: ${jobId}):`,
                    err.message,
                );
                throw err;
            }
        },
        {
            connection: redis as any,
            concurrency: 5,
        },
    );

    // Auditoria em caso de falha de cada tentativa
    worker.on("failed", async (job, err) => {
        if (!job) return;

        const jobId = job.data.jobId;
        await printJobRepository.incrementAttempts(jobId);

        const attemptsMade = job.attemptsMade;
        const maxAttempts = job.opts.attempts || 1;

        if (attemptsMade >= maxAttempts) {
            console.error(
                `[Worker] Job ${jobId} esgotou as tentativas e FALHOU permanentemente.`,
            );
            await printJobRepository.markAsFailed(jobId, err.message);
        } else {
            // Em caso de retry, volta o status do espelho para pendente aguardando a próxima tentativa
            console.warn(
                `[Worker] Job ${jobId} falhou (tentativa ${attemptsMade}/${maxAttempts}). Será re-tentado.`,
            );
            await prisma.job.update({
                where: { id: jobId },
                data: { status: "PENDING" },
            });
        }
    });

    // Tratamento Gracioso (Graceful Shutdown)
    const shutdown = async () => {
        console.log("Desligando worker...");
        await worker.close();
        process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

startWorker().catch(console.error);

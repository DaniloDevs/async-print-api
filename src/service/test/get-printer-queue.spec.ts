import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { JobInMemoryRepository } from "../../repository/in-memory/job-repo";
import { PrinterInMemoryRepository } from "../../repository/in-memory/printer-repo";
import { GetPrinterQueue } from "../get-printer-queue";
import { makeEvent } from "./factorey/makeEvent";
import { makeJob } from "./factorey/makeJob";
import { makePrinter } from "./factorey/makePrinter";

describe("Get printer queue (Service)", () => {
    let sut: GetPrinterQueue;
    let eventRepository: EventInMemoryRepository;
    let printersRepository: PrinterInMemoryRepository;
    let jobsRepository: JobInMemoryRepository;

    beforeEach(async () => {
        eventRepository = new EventInMemoryRepository();
        printersRepository = new PrinterInMemoryRepository();
        jobsRepository = new JobInMemoryRepository();

        sut = new GetPrinterQueue(printersRepository, jobsRepository);
    });

    describe("Successful cases", () => {
        it("should return pending jobs for a printer ordered by createdAt (oldest first)", async () => {
            const event = await eventRepository.create(makeEvent());
            const printer = await printersRepository.create(
                makePrinter({ eventId: event.id }),
            );

            const jobA = await jobsRepository.create(
                makeJob({ name: "job-a", payload: { printerId: printer.id } }),
            );

            const jobB = await jobsRepository.create(
                makeJob({ name: "job-b", payload: { printerId: printer.id } }),
            );

            const otherPrinter = await printersRepository.create(
                makePrinter({ name: "Other", eventId: event.id }),
            );

            await jobsRepository.create(
                makeJob({
                    name: "job-other",
                    payload: { printerId: otherPrinter.id },
                }),
            );

            const jobC = await jobsRepository.create(
                makeJob({ name: "job-c", payload: { printerId: printer.id } }),
            );

            await jobsRepository.markAsProcessing(jobC.id);

            const { jobs } = await sut.execute({
                printerId: printer.id,
                eventId: event.id,
            });

            expect(jobs).toHaveLength(2);
            expect(jobs[0].name).toBe(jobA.name);
            expect(jobs[1].name).toBe(jobB.name);
            expect(jobs.every((j) => j.payload?.printerId === printer.id)).toBe(
                true,
            );
        });
    });

    describe("Error cases", () => {
        it("should throw ResourceNotFoundError when printer does not exist for the given event", async () => {
            const event = await eventRepository.create(makeEvent());

            await expect(
                sut.execute({
                    printerId: "non-existent-id",
                    eventId: event.id,
                }),
            ).rejects.toBeInstanceOf(ResourceNotFoundError);
        });
    });
});

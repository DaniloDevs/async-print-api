import { prisma } from "../../../lib/prisma";
import { MinioStorageProvider } from "../../../provider/minio/minio-provider";
import { EventPrismaRepository } from "../../../repository/prisma/event";
import { GetEventService } from "../../event/get-event";

export function makeGetEvent() {
    const eventRepository = new EventPrismaRepository(prisma);
    const storageProvider = new MinioStorageProvider();
    const service = new GetEventService(eventRepository, storageProvider);

    return service;
}

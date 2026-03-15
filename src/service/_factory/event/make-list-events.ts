import { prisma } from "../../../lib/prisma";
import { MinioStorageProvider } from "../../../provider/minio/minio-provider";
import { EventPrismaRepository } from "../../../repository/prisma/event";
import { ListEventsService } from "../../event/list-events";

export function makeListEvents() {
    const eventRepository = new EventPrismaRepository(prisma);
    const minioProvider = new MinioStorageProvider()
    const service = new ListEventsService(eventRepository, minioProvider);

    return service;
}

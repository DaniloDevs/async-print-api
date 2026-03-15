import { prisma } from "../../../lib/prisma";
import { MinioStorageProvider } from "../../../provider/minio/minio-provider";
import { EventPrismaRepository } from "../../../repository/prisma/event";
import { UpdateEventBannerService } from "../../event/update-event-banner";

export function makeUpdateEventBannerService() {
    const eventRepository = new EventPrismaRepository(prisma);
    const storageProvider = new MinioStorageProvider();
    const service = new UpdateEventBannerService(
        eventRepository,
        storageProvider,
    );

    return service;
}

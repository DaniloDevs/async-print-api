import path from "node:path";
import { InvalidFileTypeError } from "../_errors/invalid-file-type-error";
import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import type { IStorageProvider } from "../provider/storage-provider";
import type { IEventRepository } from "../repository/events";

interface RequestDate {
    eventId: string;
    file: {
        buffer: Buffer;
        filename: string;
        mimetype: string;
    };
}
// interface ResponseDate {}

export class UpdateBannerByEventSlugService {
    constructor(
        private eventRepository: IEventRepository,
        private storageProvider: IStorageProvider,
    ) {}

    async execute({ eventId, file }: RequestDate): Promise<void> {
        if (!file.mimetype.startsWith("image/")) {
            throw new InvalidFileTypeError({
                mimetype: file.mimetype,
                allowedTypes: ["image/jpeg", "image/png"],
            });
        }

        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new ResourceNotFoundError({
                resourceType: "Event",
                resource: eventId,
            });
        }

        const ext = path.extname(file.filename);
        const filename = `${event.slug}${ext}`;

        const storedFile = await this.storageProvider.upload({
            file: file.buffer,
            filename,
            contentType: file.mimetype,
        });

        await this.eventRepository.updateBanner(eventId, storedFile);
    }
}

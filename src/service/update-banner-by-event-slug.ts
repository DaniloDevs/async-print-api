import path from "node:path";
import { InvalidFileTypeError } from "../_errors/invalid-file-type-error";
import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import type { IStorageProvider } from "../provider/storage-provider";
import type { IEventsRepository } from "../repository/events";

export class UpdateBannerByEventSlugService {
    constructor(
        private eventRepository: IEventsRepository,
        private storageProvider: IStorageProvider,
    ) {}

    async execute({
        eventId,
        file,
    }: {
        eventId: string;
        file: {
            buffer: Buffer;
            filename: string;
            mimetype: string;
        };
    }) {
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

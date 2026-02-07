import path from "node:path";
import { EventAlreadyEndedError } from "../_errors/event-already-ended-error";
import { EventNotStartedYetError } from "../_errors/event-not-started-yet-error";
import { InvalidFileTypeError } from "../_errors/invalid-file-type-error";
import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import type { IStorageProvider } from "../provider/storage-provider";
import type { IEventRepository } from "../repository/event";

interface RequestDate {
    eventId: string;
    file: {
        buffer: Buffer;
        filename: string;
        mimetype: string;
    };
}

export class UpdateEventBannerService {
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

        // Validar se o evento já foi finalizado
        if (event.status === "finished" || event.status === "canceled") {
            throw new EventAlreadyEndedError(event.endsAt);
        }

        // Validar se o evento já está acontecendo
        const now = new Date();
        if (event.startAt <= now) {
            throw new EventNotStartedYetError(event.startAt);
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

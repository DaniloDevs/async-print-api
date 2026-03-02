import type { IStorageProvider } from "../../provider/storage-provider";
import type { IEventRepository } from "../../repository/event";
import { ResourceNotFoundError } from "../_errors/resource-not-found-error";

interface RequestDate {
    slug: string;
}
interface ResponseDate {
    event: {
        startAt: Date;
        endsAt: Date;
        id: string;
        title: string;
        slug: string;
        bannerUrl: string | null;
        status: "ACTIVE" | "INACTIVE" | "DRAFT" | "FINISHED" | "CANCELED";
    };
}

export class GetEventService {
    constructor(
        private readonly eventRepository: IEventRepository,
        private readonly storageProvider: IStorageProvider,
    ) {}

    async execute({ slug }: RequestDate): Promise<ResponseDate> {
        const event = await this.eventRepository.findBySlug(slug);

        if (!event) {
            throw new ResourceNotFoundError({
                resourceType: "Event",
                resource: slug,
            });
        }

        const bannerUrl = event.bannerKey
            ? await this.storageProvider.getPublicUrl(event.bannerKey)
            : null;

        return {
            event: {
                ...event,
                bannerUrl,
            },
        };
    }
}

import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import type { IStorageProvider } from "../provider/storage-provider";
import type { Event, IEventRepository } from "../repository/event";

interface RequestDate {
    slug: string;
}
interface ResponseDate {
    event: {
        bannerUrl: string | null;
    } & Event;
}

export class GetEventBySlugService {
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
                bannerKey: bannerUrl ? event.bannerKey : null,
                bannerUrl,
            },
        };
    }
}

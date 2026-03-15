import type { IStorageProvider } from "../../provider/storage-provider";
import type { IEventRepository } from "../../repository/event";

interface ResponseDate {
    events: {
        startAt: Date;
        endsAt: Date;
        id: string;
        title: string;
        slug: string;
        bannerUrl: string | null;
        status: "ACTIVE" | "INACTIVE" | "DRAFT" | "FINISHED" | "CANCELED";
    }[];
}

export class ListEventsService {
    constructor(
        private eventRepository: IEventRepository,
        private readonly storageProvider: IStorageProvider,
    ) {}

    async execute(): Promise<ResponseDate> {
        const events = await this.eventRepository.findMany();

        const formattedEvents = await Promise.all(
            events.map(async (e) => {
                const bannerUrl = e.bannerKey
                    ? await this.storageProvider.getPublicUrl(e.bannerKey)
                    : null;

                return {
                    ...e,
                    bannerUrl,
                };
            }),
        );

        return {
            events: formattedEvents,
        };
    }
}

import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import type { IStorageProvider } from "../provider/storage-provider";
import type { Event } from "./../repository/event";
import type { IEventRepository } from "../repository/event";

type GetEventBySlugOutput = {
   bannerUrl: string | null;
} & Event;

export class GetEventBySlugService {
   constructor(
      private readonly eventRepository: IEventRepository,
      private readonly storageProvider: IStorageProvider,
   ) { }

   async execute(slug: string): Promise<GetEventBySlugOutput> {
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
         ...event,
         bannerKey: bannerUrl ? event.bannerKey : null,
         bannerUrl,
      };
   }
}

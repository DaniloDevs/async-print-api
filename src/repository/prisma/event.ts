import type { eventStatus, PrismaClient } from "../../../prisma/generated/prisma/client";
import { generateSlug } from "../../utils/generate-slug";
import type { EventCreateInput, IEventRepository } from "../event";

export class EventPrismaRepository implements IEventRepository {
    constructor(private prisma: PrismaClient) {}

    async create(data: EventCreateInput) {
        const event = await this.prisma.event.create({
            data: {
                title: data.title,
                slug: generateSlug(data.title),
                startAt: new Date(data.startAt),
                endsAt: new Date(data.endsAt),
                bannerKey: data.bannerKey,
                status: data.status as eventStatus,
            },
        });

        return event;
    }

    async findBySlug(slug: string) {
        return this.prisma.event.findUnique({
            where: { slug },
        });
    }

    async findById(id: string) {
        return this.prisma.event.findUnique({
            where: { id },
        });
    }

    async updateBanner(id: string, banner: string) {
        try {
            const event = await this.prisma.event.update({
                where: { id },
                data: {
                    bannerKey: banner,
                },
            });

            return event;
        } catch {
            return null;
        }
    }

    async updateStatus(id: string, status: eventStatus) {
        try {
            const event = await this.prisma.event.update({
                where: { id },
                data: {
                    status: status as eventStatus,
                },
            });

            return event;
        } catch {
            return null;
        }
    }

    async forceStatus(id: string, status: eventStatus): Promise<void> {
        await this.prisma.event.update({
            where: { id },
            data: {
                status: status as eventStatus,
            },
        });
    }

    async findMany() {
        return this.prisma.event.findMany();
    }
}

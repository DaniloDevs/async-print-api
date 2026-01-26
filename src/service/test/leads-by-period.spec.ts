import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type { Event } from "./../../repository/event";
import type { IEventRepository } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { LeadInMemoryRepository } from "../../repository/in-memory/leads-repo";
import type { ILeadRepository } from "../../repository/lead";
import { LeadsByPeriod } from "../leads-by-period";

describe("LeadsByPeriod - Service", () => {
    let service: LeadsByPeriod;
    let eventRepository: IEventRepository;
    let leadsRepository: ILeadRepository;
    let event: Event;

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(dayjs("2021-01-25").toDate());

        eventRepository = new EventInMemoryRepository();
        leadsRepository = new LeadInMemoryRepository();

        service = new LeadsByPeriod(eventRepository, leadsRepository);

        event = await eventRepository.create({
            title: "Event Test",
            bannerKey: null,
            status: "active",
            startAt: new Date("2021-01-25T10:00:00Z"),
            endsAt: new Date("2021-01-25T13:00:00Z"),
        });

        afterEach(() => {
            vi.useRealTimers();
        });
    });

    it("should group leads by hour within the event period", async () => {
        vi.setSystemTime(new Date("2021-01-25T10:10:00Z"));
        await leadsRepository.create({
            name: "Lead 1",
            phone: "21900000001",
            email: "lead1@email.com",
            isStudent: true,
            intendsToStudyNextYear: true,
            technicalInterest: "INF",
            segmentInterest: "ANO_1_MEDIO",
            eventId: event.id,
        });

        // Lead 2 - 10:40
        vi.setSystemTime(new Date("2021-01-25T10:40:00Z"));
        await leadsRepository.create({
            name: "Lead 2",
            phone: "21900000002",
            email: "lead2@email.com",
            isStudent: true,
            intendsToStudyNextYear: true,
            technicalInterest: "INF",
            segmentInterest: "ANO_1_MEDIO",
            eventId: event.id,
        });

        // Lead 3 - 11:15
        vi.setSystemTime(new Date("2021-01-25T11:15:00Z"));
        await leadsRepository.create({
            name: "Lead 3",
            phone: "21900000003",
            email: "lead3@email.com",
            isStudent: true,
            intendsToStudyNextYear: true,
            technicalInterest: "INF",
            segmentInterest: "ANO_1_MEDIO",
            eventId: event.id,
        });

        const result = await service.execute({ eventId: event.id });

        expect(result.leads).toEqual([
            { hour: "2021-01-25T10:00:00.000Z", total: 2 },
            { hour: "2021-01-25T11:00:00.000Z", total: 1 },
            { hour: "2021-01-25T12:00:00.000Z", total: 0 },
        ]);
    });

    it("should return zeroed buckets when no leads exist", async () => {
        const result = await service.execute({ eventId: event.id });

        expect(result.leads).toEqual([
            { hour: "2021-01-25T10:00:00.000Z", total: 0 },
            { hour: "2021-01-25T11:00:00.000Z", total: 0 },
            { hour: "2021-01-25T12:00:00.000Z", total: 0 },
        ]);
    });

    it("should throw ResourceNotFoundError if event does not exist", async () => {
        await expect(
            service.execute({ eventId: "non-existent-id" }),
        ).rejects.toBeInstanceOf(ResourceNotFoundError);
    });
});

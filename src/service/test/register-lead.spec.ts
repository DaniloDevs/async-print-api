import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventAlreadyEndedError } from "../../_errors/event-already-ended-error";
import { EventNotActiveError } from "../../_errors/event-not-active-error";
import { EventNotStartedYetError } from "../../_errors/event-not-started-yet-error";
import { LeadAlreadyRegisteredError } from "../../_errors/lead-already-registered-error";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type { EventCreateInput, IEventRepository } from "../../repository/event";
import { EventInMemoryRepository } from "../../repository/in-memory/events-repo";
import { LeadInMemoryRepository } from "../../repository/in-memory/leads-repo";
import type { ILeadRepository, LeadCreateInput } from "../../repository/lead";
import { RegisterLeadService } from "../register-lead";

describe("Register Lead - Service", () => {
    let eventRepository: IEventRepository;
    let leadRepository: ILeadRepository;
    let service: RegisterLeadService;

    const eventInput: EventCreateInput = {
        title: "Event Test",
        bannerKey: null,
        status: "active",
        startAt: dayjs("2021-01-25").toDate(),
        endsAt: dayjs("2021-01-25").add(3, "day").toDate(),
    };

    const leadInput: LeadCreateInput = {
        name: "Danilo Ribeiro Pinho",
        phone: "21 983294521",
        email: "yuri.sena@loidecriativo.com.br",
        isStudent: true,
        intendsToStudyNextYear: true,
        technicalInterest: "INF",
        segmentInterest: "ANO_1_MEDIO",
        eventId: "",
    };

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(dayjs("2021-01-25").toDate());

        eventRepository = new EventInMemoryRepository();
        leadRepository = new LeadInMemoryRepository();
        service = new RegisterLeadService(eventRepository, leadRepository);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("deve registrar um lead com telefone normalizado", async () => {
        const event = await eventRepository.create(eventInput);

        vi.setSystemTime(dayjs(event.startAt).add(2, "hour").toDate());

        const { lead } = await service.execute({
            data: { ...leadInput, eventId: event.id },
            eventId: event.id,
        });

        expect(lead.phone).toBe("+5521983294521");
    });

    it("deve lançar erro se o evento não existir", async () => {
        eventRepository.findBySlug("non-exist-event");

        await expect(() =>
            service.execute({ data: leadInput, eventId: "non-exist" }),
        ).rejects.toBeInstanceOf(ResourceNotFoundError);
    });

    it("deve lançar erro se o evento não estiver ativo", async () => {
        const event = await eventRepository.create({
            ...eventInput,
            status: "draft",
        });

        await expect(() =>
            service.execute({
                data: { ...leadInput, eventId: event.id },
                eventId: event.id,
            }),
        ).rejects.toBeInstanceOf(EventNotActiveError);
    });

    it("deve lançar erro se o evento ainda não começou", async () => {
        const event = await eventRepository.create({
            ...eventInput,
            startAt: dayjs().add(1, "day").toDate(),
        });

        await expect(() =>
            service.execute({
                data: { ...leadInput, eventId: event.id },
                eventId: event.id,
            }),
        ).rejects.toBeInstanceOf(EventNotStartedYetError);
    });

    it("deve lançar erro se o evento já terminou", async () => {
        const event = await eventRepository.create(eventInput);

        vi.setSystemTime(dayjs("2021-02-29").toDate());

        await expect(() =>
            service.execute({
                data: { ...leadInput, eventId: event.id },
                eventId: event.id,
            }),
        ).rejects.toBeInstanceOf(EventAlreadyEndedError);
    });

    it("deve lançar erro se o lead já estiver registrado no evento", async () => {
        const event = await eventRepository.create(eventInput);
        await leadRepository.create(leadInput);

        await expect(() =>
            service.execute({
                data: { ...leadInput, eventId: event.id },
                eventId: event.id,
            }),
        ).rejects.toBeInstanceOf(LeadAlreadyRegisteredError);
    });
});

import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventAlreadyEndedError } from "../../_errors/event-already-ended-error";
import { EventNotActiveError } from "../../_errors/event-not-active-error";
import { EventNotStartedYetError } from "../../_errors/event-not-started-yet-error";
import { LeadAlreadyRegisteredError } from "../../_errors/lead-already-registered-error";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type {
    EventsCreateInput,
    IEventsRepository,
} from "../../repository/events";
import { EventsInMemomryRepository } from "../../repository/in-memory/events-repo";
import { LeadsInMemomryRepository } from "../../repository/in-memory/leads-repo";
import type {
    ILeadsrepository,
    LeadsCreateInput,
} from "../../repository/lead";
import { RegisterLeadService } from "../register-lead";

describe("Register Lead - Service", () => {
    let eventRepository: IEventsRepository;
    let leadRepository: ILeadsrepository;
    let service: RegisterLeadService;

    const eventInput: EventsCreateInput = {
        title: "Event Test",
        bannerKey: null,
        status: "active",
        startAt: dayjs("2021-01-25").toDate(),
        endsAt: dayjs("2021-01-25").add(3, "day").toDate(),
    };

    const leadInput: LeadsCreateInput = {
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

        eventRepository = new EventsInMemomryRepository();
        leadRepository = new LeadsInMemomryRepository();
        service = new RegisterLeadService(eventRepository, leadRepository);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("deve registrar um lead com telefone normalizado", async () => {
        const event = await eventRepository.create(eventInput);

        vi.setSystemTime(dayjs(event.startAt).add(2, "hour").toDate());
        const result = await service.execute(
            { ...leadInput, eventId: event.id },
            event.id,
        );

        expect(result.phone).toBe("+5521983294521");
    });

    it("deve lançar erro se o evento não existir", async () => {
        eventRepository.findBySlug("non-exist-event");

        await expect(() =>
            service.execute(leadInput, "invalid-slug"),
        ).rejects.toBeInstanceOf(ResourceNotFoundError);
    });

    it("deve lançar erro se o evento não estiver ativo", async () => {
        const event = await eventRepository.create({
            ...eventInput,
            status: "draft",
        });

        await expect(() =>
            service.execute({ ...leadInput, eventId: event.id }, event.id),
        ).rejects.toBeInstanceOf(EventNotActiveError);
    });

    it("deve lançar erro se o evento ainda não começou", async () => {
        const event = await eventRepository.create({
            ...eventInput,
            startAt: dayjs().add(1, "day").toDate(),
        });

        await expect(() =>
            service.execute({ ...leadInput, eventId: event.id }, event.id),
        ).rejects.toBeInstanceOf(EventNotStartedYetError);
    });

    it("deve lançar erro se o evento já terminou", async () => {
        const event = await eventRepository.create(eventInput);

        vi.setSystemTime(dayjs("2021-02-29").toDate());

        await expect(() =>
            service.execute({ ...leadInput, eventId: event.id }, event.id),
        ).rejects.toBeInstanceOf(EventAlreadyEndedError);
    });

    it("deve lançar erro se o lead já estiver registrado no evento", async () => {
        const event = await eventRepository.create(eventInput);
        await leadRepository.create(leadInput);

        await expect(() =>
            service.execute({ ...leadInput, eventId: event.id }, event.id),
        ).rejects.toBeInstanceOf(LeadAlreadyRegisteredError);
    });
});

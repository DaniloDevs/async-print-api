import dayjs from "dayjs";
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";
import { EventAlreadyEndedError } from "../../_errors/event-already-ended-error";
import { EventNotActiveError } from "../../_errors/event-not-active-error";
import { EventNotStartedYetError } from "../../_errors/event-not-started-yet-error";
import { LeadAlreadyRegisteredError } from "../../_errors/lead-already-registered-error";
import { ResourceNotFoundError } from "../../_errors/resource-not-found-error";
import type {
    EventCreateInput,
    IEventRepository,
} from "../../repository/event";
import { EventInMemomryRepository } from "../../repository/in-memory/event";
import { LeadInMemomryRepository } from "../../repository/in-memory/lead";
import type { ILeadrepository, LeadCreateInput } from "../../repository/lead";
import { CreateLeadByEventSlugService } from "../create-lead.by-event-slug";

describe("RegisterLeadByEventSlugService", () => {
    let eventRepository: IEventRepository;
    let leadRepository: ILeadrepository;
    let service: CreateLeadByEventSlugService;

    const eventInput: EventCreateInput = {
        title: "Event Test",
        banner: null,
        isActivated: true,
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

        eventRepository = new EventInMemomryRepository();
        leadRepository = new LeadInMemomryRepository();
        service = new CreateLeadByEventSlugService(
            eventRepository,
            leadRepository,
        );
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("deve registrar um lead com telefone normalizado", async () => {
        const event = await eventRepository.create(eventInput);

        vi.setSystemTime(dayjs(event.startAt).add(2, "hour").toDate());
        const result = await service.execute(
            { ...leadInput, eventId: event.id },
            event.slug,
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
            isActivated: false,
        });

        await expect(() =>
            service.execute({ ...leadInput, eventId: event.id }, event.slug),
        ).rejects.toBeInstanceOf(EventNotActiveError);
    });

    it("deve lançar erro se o evento ainda não começou", async () => {
        const event = await eventRepository.create({
            ...eventInput,
            startAt: dayjs().add(1, "day").toDate(),
        });

        await expect(() =>
            service.execute({ ...leadInput, eventId: event.id }, event.slug),
        ).rejects.toBeInstanceOf(EventNotStartedYetError);
    });

    it("deve lançar erro se o evento já terminou", async () => {
        const event = await eventRepository.create(eventInput);

        vi.setSystemTime(dayjs("2021-02-29").toDate());

        await expect(() =>
            service.execute({ ...leadInput, eventId: event.id }, event.slug),
        ).rejects.toBeInstanceOf(EventAlreadyEndedError);
    });

    it("deve lançar erro se o lead já estiver registrado no evento", async () => {
        const event = await eventRepository.create(eventInput);
        await leadRepository.create(leadInput);

        await expect(() =>
            service.execute({ ...leadInput, eventId: event.id }, event.slug),
        ).rejects.toBeInstanceOf(LeadAlreadyRegisteredError);
    });
});

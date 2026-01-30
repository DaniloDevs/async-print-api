import dayjs from "dayjs";
import { EventAlreadyEndedError } from "../_errors/event-already-ended-error";
import { EventNotActiveError } from "../_errors/event-not-active-error";
import { EventNotStartedYetError } from "../_errors/event-not-started-yet-error";
import { LeadAlreadyRegisteredError } from "../_errors/lead-already-registered-error";
import { ResourceNotFoundError } from "../_errors/resource-not-found-error";
import type { IEventRepository, Event } from "../repository/event";
import type {
    ILeadRepository,
    Lead,
    LeadCreateInput,
} from "../repository/lead";

interface RequestDate {
    eventId: string;
    data: LeadCreateInput;
}
interface ResponseDate {
    lead: Lead;
}

export class CreateLeadService {
    constructor(
        private eventRepository: IEventRepository,
        private leadRepository: ILeadRepository,
    ) { }

    async execute({ data, eventId }: RequestDate): Promise<ResponseDate> {
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new ResourceNotFoundError({
                resourceType: "Event",
                resource: eventId,
            });
        }

        if (event.status !== "active") {
            throw new EventNotActiveError(eventId);
        }

        this.isValidPeriod(event.startAt, event.endsAt);

        const existingLead = await this.leadRepository.findByEmailAndEventId(
            data.email,
            event.id,
        );

        if (existingLead) {
            throw new LeadAlreadyRegisteredError(data.email, eventId);
        }

        const formattedPhoneNumber = this.normalizePhoneNumber(data.phone);

    
        const lead = await this.leadRepository.create({
            ...data,
            eventId: event.id,
            phone: formattedPhoneNumber,
        });
        

        return { lead };
    }

    isValidPeriod(from: Date, to: Date) {
        const startEventDate = dayjs(from);
        const endEventDate = to ? dayjs(to) : null;
        const now = dayjs();

        if (now.isBefore(startEventDate)) {
            throw new EventNotStartedYetError(from);
        }

        if (endEventDate && now.isAfter(endEventDate)) {
            throw new EventAlreadyEndedError(to);
        }
    }

    normalizePhoneNumber(phone: string): string {
        // Remove tudo que não for número
        const digits = phone.replace(/\D/g, "");

        // Valida tamanho (10 para fixo, 11 para celular)
        if (digits.length < 10 || digits.length > 11) {
            throw new Error("Telefone deve ter 10 ou 11 dígitos");
        }

        // Valida DDD
        const ddd = digits.slice(0, 2);
        const dddNumber = Number(ddd);
        if (dddNumber < 11 || dddNumber > 99) {
            throw new Error("DDD inválido");
        }

        const number = digits.slice(2);

        // Valida celular com 9 dígitos (deve começar com 9)
        if (number.length === 9 && number[0] !== "9") {
            throw new Error("Celular deve começar com 9");
        }

        // Retorna no formato internacional
        return `+55${ddd}${number}`;
    }
}

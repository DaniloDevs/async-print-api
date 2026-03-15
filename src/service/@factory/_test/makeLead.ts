import type { originLead, segment, technical } from "../../../repository/lead";

type MakeLeadOverrides = Partial<{
    name: string;
    phone: string;
    email: string;
    isStudent: boolean;
    intentionNextYear: boolean;
    technical: technical;
    segment: segment;
    origin: originLead;
    eventId: string;
}>;

export function makeLead(overrides: MakeLeadOverrides = {}) {
    return {
        name: "Danilo Ribeiro Pinho",
        phone: "21999999999",
        email: "lead@email.com",
        isStudent: true,
        intentionNextYear: true,
        technical: "NONE" as technical,
        segment: "ANO_1_MEDIO" as segment,
        eventId: "",
        origin: "manual" as originLead,
        ...overrides,
    };
}

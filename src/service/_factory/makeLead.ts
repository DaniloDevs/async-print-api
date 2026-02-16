import type {
    OrigenLead,
    segment,
    technical,
} from "../../repository/lead";

type MakeLeadOverrides = Partial<{
    name: string;
    phone: string;
    email: string;
    isStudent: boolean;
    intendsToStudyNextYear: boolean;
    technical: technical;
    segment: segment;
    origen: OrigenLead;
    eventId: string;
}>;

export function makeLead(overrides: MakeLeadOverrides = {}) {
    return {
        name: "Danilo Ribeiro Pinho",
        phone: "21999999999",
        email: "lead@email.com",
        isStudent: true,
        intendsToStudyNextYear: true,
        technical: "NONE" as technical,
        segment: "ANO_1_MEDIO" as segment,
        eventId: "",
        origen: "manual" as OrigenLead,
        ...overrides,
    };
}

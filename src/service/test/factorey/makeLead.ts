import type {
    OrigenLead,
    SegmentInterest,
    TechnicalInterest,
} from "../../../repository/lead";

type MakeLeadOverrides = Partial<{
    name: string;
    phone: string;
    email: string;
    isStudent: boolean;
    intendsToStudyNextYear: boolean;
    technicalInterest: TechnicalInterest;
    segmentInterest: SegmentInterest;
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
        technicalInterest: "NONE" as TechnicalInterest,
        segmentInterest: "ANO_1_MEDIO" as SegmentInterest,
        eventId: "",
        origen: "manual" as OrigenLead,
        ...overrides,
    };
}

import type {
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
    eventId: string;
}>;

export function makeLead(overrides: MakeLeadOverrides = {}) {
    return {
        name: "Lead",
        phone: "21999999999",
        email: "lead@email.com",
        isStudent: true,
        intendsToStudyNextYear: true,
        technicalInterest: "NONE" as TechnicalInterest,
        segmentInterest: "ANO_1_MEDIO" as SegmentInterest,
        eventId: "",
        ...overrides,
    };
}

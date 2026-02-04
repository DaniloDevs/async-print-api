import z from "zod";

const technicalInterestEnum = z.enum(["ENF", "INF", "ADM", "NONE"]);

const origenEnum = z.enum(["qrcode", "instagram", "manual"]);

const segmentInterest = z.enum([
    "NONE",
    "JARDIM_1",
    "JARDIM_2",
    "ANO_1_FUNDAMENTAL",
    "ANO_2_FUNDAMENTAL",
    "ANO_3_FUNDAMENTAL",
    "ANO_4_FUNDAMENTAL",
    "ANO_5_FUNDAMENTAL",
    "ANO_6_FUNDAMENTAL",
    "ANO_7_FUNDAMENTAL",
    "ANO_8_FUNDAMENTAL",
    "ANO_9_FUNDAMENTAL",
    "ANO_1_MEDIO",
    "ANO_2_MEDIO",
    "ANO_3_MEDIO",
]);

const lead = z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string(),
    email: z.string(),
    isStudent: z.boolean(),
    intendsToStudyNextYear: z.boolean().default(false),
    origen: z.enum(origenEnum.options).default("manual"),
    technicalInterest: z.enum(technicalInterestEnum.options).default("NONE"),
    segmentInterest: z.enum(segmentInterest.options).default("NONE"),
    createdAt: z.date(),
    eventId: z.string(),
});

const leadCreateInput = lead.omit({
    id: true,
    createdAt: true,
});


export const leadJobPayload = lead.pick({
    id: true,
    name: true,
    phone: true,
    email: true,
})


export type Lead = z.infer<typeof lead>;
export type LeadCreateInput = z.infer<typeof leadCreateInput>;
export type SegmentInterest = z.infer<typeof segmentInterest>;
export type TechnicalInterest = z.infer<typeof technicalInterestEnum>;
export type OrigenLead = z.infer<typeof origenEnum>;
export type PrintJobPayload = z.infer<typeof leadJobPayload>;

export interface ILeadRepository {
    create(data: LeadCreateInput): Promise<Lead>;
    findByEmailAndEventId(email: string, eventId: string): Promise<Lead | null>;
    findManyByEventId(eventId: string): Promise<Lead[]>;
}

import z from "zod";

const technicalEnum = z.enum(["ENF", "INF", "ADM", "NONE"]);

const originEnum = z.enum(["QRCODE", "INSTAGRAM", "MANUAL"]);

const segment = z.enum([
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
    intentionNextYear: z.boolean().default(false),
    origin: z.enum(originEnum.options).default("MANUAL"),
    technical: z.enum(technicalEnum.options).default("NONE"),
    segment: z.enum(segment.options).default("NONE"),
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
});

export type Lead = z.infer<typeof lead>;
export type LeadCreateInput = z.infer<typeof leadCreateInput>;
export type segment = z.infer<typeof segment>;
export type technical = z.infer<typeof technicalEnum>;
export type originLead = z.infer<typeof originEnum>;
export type PrintJobPayload = z.infer<typeof leadJobPayload>;

export interface ILeadRepository {
    create(data: LeadCreateInput): Promise<Lead>;
    findByEmailAndEventId(email: string, eventId: string): Promise<Lead | null>;
    findManyByEventId(eventId: string): Promise<Lead[]>;
}

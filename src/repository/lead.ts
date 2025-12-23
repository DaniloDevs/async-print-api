import z from "zod";

const technicalInterestEnum = z.enum(["ENF", "INF", "ADM", "NONE"]);

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
    phone: z
        .string()
        .transform((val) => val.replace(/\D/g, ""))
        .refine((val) => val.length === 10 || val.length === 11, {
            message: "Telefone deve ter 10 ou 11 dígitos",
        })
        .refine(
            (val) => {
                const ddd = Number(val.slice(0, 2));
                return ddd >= 11 && ddd <= 99;
            },
            {
                message: "DDD inválido",
            },
        )
        .refine(
            (val) => {
                if (val.length === 11) {
                    return val[2] === "9";
                }
                return true;
            },
            {
                message: "Celular deve começar com 9",
            },
        ),
    email: z.string(),
    isStudent: z.boolean(),
    intendsToStudyNextYear: z.boolean().default(false),
    technicalInterest: z.enum(technicalInterestEnum.options).default("NONE"),
    segmentInterest: z.enum(segmentInterest.options).default("NONE"),
    createdAt: z.date(),
    eventId: z.string(),
});

const leadCreateInput = lead.omit({
    id: true,
    createdAt: true,
});

export type Lead = z.infer<typeof lead>;
export type LeadCreateInput = z.infer<typeof leadCreateInput>;

export interface ILeadrepository {
    create(data: LeadCreateInput): Promise<Lead>;
    findByEmailAndEventId(email: string, eventId: string): Promise<Lead | null>;
    findManyByEventId(eventId: string): Promise<Lead[]>
}

import z from "zod";

export const printerTypeEnum = z.enum([
    "thermal",
    "inkjet",
    "laser",
    "pdf",
    "network",
]);

export const printerStatusEnum = z.enum([
    "disconnected",
    "connected",
    "printing",
]);

const printer = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    path: z.string(),
    description: z.string().optional(),
    type: printerTypeEnum,
    status: printerStatusEnum.default("disconnected"),
    createdAt: z.date(),
});

const printerCreateInput = printer.omit({
    id: true,
    slug: true,
    createdAt: true,
});

export type Printer = z.infer<typeof printer>;
export type PrinterCreateInput = z.infer<typeof printerCreateInput>;
export type PrinterTypeEnum = z.infer<typeof printerTypeEnum>;
export type PrinterStatusEnum = z.infer<typeof printerStatusEnum>;

export interface IPrinterRepository {
    create(data: PrinterCreateInput): Promise<Printer>;
    findBySlug(slug: string): Promise<Printer | null>;
}

import type {
    PrinterStatusEnum,
    PrinterTypeEnum,
} from "../../../repository/printer";

type MakePrinterOverrides = Partial<{
    name: string;
    slug: string;
    path: string;
    description: string;
    type: PrinterTypeEnum;
    status: PrinterStatusEnum;
    eventId: string;
}>;

export function makePrinter(overrides: MakePrinterOverrides = {}) {
    return {
        name: "Impressora Teste",
        slug: "impressora-teste",
        path: "/dev/usb/lp-test",
        description: undefined,
        type: "network" as PrinterTypeEnum,
        status: "disconnected" as PrinterStatusEnum,
        eventId: "",
        ...overrides,
    };
}

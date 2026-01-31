import { PrinterAlreadyExistsError } from "../_errors/printer-already-exist-error";
import type { IPrinterProvider } from "../provider/Printer-provider";
import type {
    IPrinterRepository,
    Printer,
    PrinterCreateInput,
} from "../repository/printer";
import { generateSlug } from "../utils/generate-slug";

interface RequestDate {
    data: PrinterCreateInput;
}
interface ResponseDate {
    printer: Printer;
}

export class CreatePrinterService {
    constructor(
        private printerRepository: IPrinterRepository,
        private printerProvider: IPrinterProvider,
    ) {}

    async execute({ data }: RequestDate): Promise<ResponseDate> {
        const existPrint = await this.printerRepository.findBySlug(
            generateSlug(data.name),
        );
        if (existPrint) {
            throw new PrinterAlreadyExistsError(generateSlug(data.name));
        }

        const printerIsAvailable = await this.printerProvider.isAvailable(
            data.path,
        );

        const printer = await this.printerRepository.create({
            ...data,
            status: printerIsAvailable ? "connected" : "disconnected",
        });

        return { printer };
    }
}

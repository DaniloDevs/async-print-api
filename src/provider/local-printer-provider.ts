import { IPrinterProvider } from "./Printer-provider";

export class LocalPrinterProvider implements IPrinterProvider {
    async isAvailable(path: string): Promise<boolean> {
        // Dummy implementation for now
        return true;
    }
}

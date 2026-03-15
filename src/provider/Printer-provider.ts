export interface IPrinterProvider {
    isAvailable(path: string): Promise<boolean>;
}

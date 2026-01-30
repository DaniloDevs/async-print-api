export type uploadInput = {
    file: Buffer;
    filename: string;
    contentType: string;
};

export interface IStorageProvider {
    upload(input: uploadInput): Promise<string>;
    getPublicUrl(key: string): Promise<string>;
}

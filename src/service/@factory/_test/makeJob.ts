type MakeJobOverrides = Partial<{
    name: string;
    payload: any;
    maxAttempts: number;
}>;

export function makeJob(overrides: MakeJobOverrides = {}) {
    return {
        name: "Print Document",
        payload: {
            printerId: "",
            document: "file.pdf",
        },
        maxAttempts: 3,
        ...overrides,
    };
}

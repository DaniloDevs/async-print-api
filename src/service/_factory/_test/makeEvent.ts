import dayjs from "dayjs";
import type { EventStatus } from "../../../repository/event";

type MakeEventOverrides = Partial<{
    title: string;
    bannerKey: string | null;
    status: EventStatus;
    startAt: Date;
    endsAt: Date;
}>;

const NOW = dayjs("2024-01-01T12:00:00Z");

export function makeEvent(overrides: MakeEventOverrides = {}) {
    return {
        title: "Event Test",
        bannerKey: null,
        status: "active" as EventStatus,
        startAt: NOW.toDate(),
        endsAt: NOW.add(5, "hour").toDate(),
        ...overrides,
    };
}

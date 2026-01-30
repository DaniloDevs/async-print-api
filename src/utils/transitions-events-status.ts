import type { EventsStatus } from "../repository/events";

export const allowedTransitions: Record<EventsStatus, EventsStatus[]> = {
    draft: ["active", "canceled"],
    active: ["finished", "canceled", "inactive"],
    inactive: ["active", "finished", "canceled"],
    finished: ["canceled"],
    canceled: [],
};

import type { FastifyInstance } from "fastify";
import { VerifyJwt } from "../../middleware/verify-jwt";
import CreateEventController, {
    createEventControllerSchema,
} from "./create-event";
import GetEventController, { getEventControllerSchema } from "./get-event";
import GetEventMetricsController, {
    getEventMetricsControllerSchema,
} from "./get-event-metrics";
import ListEventsController, {
    listEventsControllerSchema,
} from "./list-events";
import UpdateEventBannerController, {
    updateEventBannerControllerSchema,
} from "./update-event-banner";
import UpdateEventStatusController, {
    updateEventStatusControllerSchema,
} from "./update-event-status";

export default async function EventRoutes(server: FastifyInstance) {
    server.post(
        "/events",
        {
            schema: createEventControllerSchema,
            onRequest: [VerifyJwt],
        },
        CreateEventController,
    );

    server.get(
        "/events/:eventId/metrics",
        {
            schema: getEventMetricsControllerSchema,
            onRequest: [VerifyJwt],
        },
        GetEventMetricsController,
    );

    server.patch(
        "/events/:eventId/update-status",
        {
            schema: updateEventStatusControllerSchema,
            onRequest: [VerifyJwt],
        },
        UpdateEventStatusController,
    );

    server.patch(
        "/events/:eventId/update-banner",
        {
            schema: updateEventBannerControllerSchema,
            onRequest: [VerifyJwt],
        },
        UpdateEventBannerController,
    );

    server.get(
        "/events/:slug",
        {
            schema: getEventControllerSchema,
            onRequest: [VerifyJwt],
        },
        GetEventController,
    );

    server.get(
        "/events",
        {
            schema: listEventsControllerSchema,
            onRequest: [VerifyJwt],
        },
        ListEventsController,
    );
}

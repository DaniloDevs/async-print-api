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
    server.addHook("onRequest", VerifyJwt);
    
    server.post(
        "/events",
        {
            schema: createEventControllerSchema,
        },
        CreateEventController,
    );

    server.get(
        "/events/:eventId/metrics",
        {
            schema: getEventMetricsControllerSchema,
        },
        GetEventMetricsController,
    );

    server.patch(
        "/events/:eventId/update-status",
        {
            schema: updateEventStatusControllerSchema,
        },
        UpdateEventStatusController,
    );

    server.patch(
        "/events/:eventId/update-banner",
        {
            schema: updateEventBannerControllerSchema,
        },
        UpdateEventBannerController,
    );

    server.get(
        "/events/:slug",
        {
            schema: getEventControllerSchema,
        },
        GetEventController,
    );

    server.get(
        "/events",
        {
            schema: listEventsControllerSchema,
        },
        ListEventsController,
    );
}

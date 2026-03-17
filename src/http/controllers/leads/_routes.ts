import type { FastifyInstance } from "fastify";
import { VerifyJwt } from "../../middleware/verify-jwt";
import CreateLeadController, {
    createLeadControllerSchema,
} from "./create-lead";
import ExportEventLeadsController, {
    exportEventLeadsControllerSchema,
} from "./export-event-leads";
import GetLeadMetricsByOriginController, {
    getLeadMetricsByOriginControllerSchema,
} from "./get-lead-by-origen";
import GetLeadMetricsBySegmentController, {
    getLeadMetricsBySegmentControllerSchema,
} from "./get-lead-by-segment";
import GetLeadMetricsByTechnicalController, {
    getLeadMetricsByTechnicalControllerSchema,
} from "./get-lead-by-technial";
import GetLeadCaptureMetricsController, {
    getLeadCaptureMetricsControllerSchema,
} from "./get-lead-metrics";
import ListEventLeadsController, {
    listEventLeadsControllerSchema,
} from "./list-event-leads";
import ListLeadsByPeriodController, {
    listLeadsByPeriodControllerSchema,
} from "./list-leads-by-period";

export default async function LeadsRoutes(server: FastifyInstance) {
    server.addHook("onRequest", VerifyJwt);

    server.get(
        "/events/:eventId/leads-by-period",
        {
            schema: listLeadsByPeriodControllerSchema,
        },
        ListLeadsByPeriodController,
    );
    server.post(
        "/leads",
        {
            schema: createLeadControllerSchema,
        },
        CreateLeadController,
    );
    server.get(
        "/events/:slug/leads/export",
        { schema: exportEventLeadsControllerSchema },
        ExportEventLeadsController,
    );
    server.get(
        "/events/:slug/leads/metrics",
        { schema: getLeadCaptureMetricsControllerSchema },
        GetLeadCaptureMetricsController,
    );
    server.get(
        "/events/:eventId/leads/metrics/origin",
        { schema: getLeadMetricsByOriginControllerSchema },
        GetLeadMetricsByOriginController,
    );
    server.get(
        "/events/:eventId/leads/metrics/segment",
        { schema: getLeadMetricsBySegmentControllerSchema },
        GetLeadMetricsBySegmentController,
    );
    server.get(
        "/events/:eventId/leads/metrics/technical",
        { schema: getLeadMetricsByTechnicalControllerSchema },
        GetLeadMetricsByTechnicalController,
    );
    server.get(
        "/events/:slug/leads",
        { schema: listEventLeadsControllerSchema },
        ListEventLeadsController,
    );
}

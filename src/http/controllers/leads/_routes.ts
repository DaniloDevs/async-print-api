import type { FastifyInstance } from "fastify";
import CreateLeadController, {
    createLeadControllerSchema,
} from "./create-lead";
import ListLeadsByPeriodController, {
    listLeadsByPeriodControllerSchema,
} from "./list-leads-by-period";

export default async function LeadsRoutes(server: FastifyInstance) {
    // server.addHook("onRequest", VerifyJwt);

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
}

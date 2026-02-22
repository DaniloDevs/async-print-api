import type { FastifyInstance } from "fastify";
import { VerifyJwt } from "../../middleware/verify-jwt";
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
}

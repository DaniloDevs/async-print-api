import type { FastifyInstance } from "fastify";
import ListLeadsByPeriodController, {
    listLeadsByPeriodControllerSchema,
} from "./list-leads-by-period";
import { VerifyJwt } from "../../middleware/verify-jwt";

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

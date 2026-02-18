import type { FastifyInstance } from "fastify";
import ListLeadsByPeriodController, {
    listLeadsByPeriodControllerSchema,
} from "./list-leads-by-period";

export default async function LeadsRoutes(server: FastifyInstance) {
    server.get(
        "/events/:eventId/leads-by-period",
        {
            schema: listLeadsByPeriodControllerSchema,
        },
        ListLeadsByPeriodController,
    );
}

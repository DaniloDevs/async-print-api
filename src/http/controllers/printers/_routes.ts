import type { FastifyInstance } from "fastify";
import { VerifyJwt } from "../../middleware/verify-jwt";
import CreatePrinterController, { createPrinterControllerSchema } from "./create-printer";
import GetPrinterQueueController, { getPrinterQueueControllerSchema } from "./get-printer-queue";
import ListEventPrintersController, { listEventPrintersControllerSchema } from "./list-event-printers";

export default async function PrintersRoutes(server: FastifyInstance) {
    server.addHook("onRequest", VerifyJwt);

    server.post(
        "/printers",
        { schema: createPrinterControllerSchema },
        CreatePrinterController,
    );
    server.get(
        "/events/:eventId/printers/:printerId/queue",
        { schema: getPrinterQueueControllerSchema },
        GetPrinterQueueController,
    );
    server.get(
        "/events/:eventId/printers",
        { schema: listEventPrintersControllerSchema },
        ListEventPrintersController,
    );
}

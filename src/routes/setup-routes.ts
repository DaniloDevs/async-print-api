import type { FastifyInstance } from "fastify";
import { CreateEvent } from "./events/create-event";
import CreateLeadsByEventSlug from "./events/create-lead-by-slug";
import { ExportEventLeads } from "./events/export-event-leads";
import ListEventsBySlug from "./events/get-events-by-slug";
import { ListEvents } from "./events/list-events";
import { ListLeadsByEvent } from "./events/list-leads-by-event";
import { UpdateEventBanner } from "./events/update-event-banner";
import { UpdateEventStatus } from "./events/update-event-status";
import { LeadsPerHour } from "./metrics/leads-per-hour";
import { OverviewMetrics } from "./metrics/overview";
import { ConfigurePrintDevice } from "./printer/configure-print";
import { DetectPrinter } from "./printer/detect-printer";
import { GetPrintStatus } from "./printer/get-print-status";
import { TestPrintDevice } from "./printer/test-print-device";

export default async function SetupRoutes(app: FastifyInstance) {
  // Create Lead
  app.register(CreateLeadsByEventSlug);

  // Printers
  app.register(DetectPrinter);
  app.register(GetPrintStatus);
  app.register(TestPrintDevice);
  app.register(ConfigurePrintDevice);

  // Events
  app.register(CreateEvent);
  app.register(ListEvents);
  app.register(ListLeadsByEvent);
  app.register(ListEventsBySlug);
  app.register(UpdateEventStatus);
  app.register(UpdateEventBanner);
  app.register(ExportEventLeads);

  // Metrics
  app.register(OverviewMetrics);
  app.register(LeadsPerHour);
}

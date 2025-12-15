import dayjs from "dayjs";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../connections/prisma";

export function LeadsPerHour(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/:eventSlug/metrics/leads-per-hour",
    {
      schema: {
        summary: "Retrieve lead acquisition timeline",
        tags: ["Metrics"],
        description:
          "Generates a temporal histogram of lead capture activity. Data is grouped into 30-minute intervals within the event's start and end schedule. Ideal for visualizing traffic peaks and throughput over time.",
        params: z.object({
          eventSlug: z.string(),
        }),
        response: {
          200: z.object({
            event: z.object({
              title: z.string(),
              startIn: z.union([z.string(), z.date()]),
              endIn: z.union([z.string(), z.date()]),
              totalLeads: z.number().int().nonnegative(),
            }),

            timeline: z.array(
              z.object({
                hour: z.string(),
                count: z.number().int().nonnegative(),
              }),
            ),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { eventSlug } = request.params;

      const [event, leads] = await prisma.$transaction([
        prisma.events.findUnique({
          where: { slug: eventSlug },
          select: { startIn: true, endIn: true, title: true, _count: { select: { leads: true } } },
        }),
        prisma.leads.findMany({
          where: {
            events: { slug: eventSlug },
            isValid: true,
          },
          select: { createdAt: true },
        }),
      ]);

      if (!event) {
        return reply.status(404).send({ message: "Event not found" });
      }

      // 30 minutos (ajuste aqui para 60, 15, etc.)
      const interval = 30;

      // 1. Gerar intervalos
      const slots = generateTimeSlots(event.startIn, event.endIn, interval);

      // 2. Inicializar estrutura
      const map = slots.reduce<Record<string, number>>((acc, slot) => {
        acc[slot] = 0;
        return acc;
      }, {});

      // 3. Distribuir leads nos slots corretos
      leads.forEach((lead) => {
        const slot = getLeadSlot(lead.createdAt, interval);
        if (map[slot] !== undefined) map[slot]++;
      });

      // 4. Transformar em array (o formato que você pediu)
      const result = slots.map((slot) => ({
        hour: slot,
        count: map[slot],
      }));

      return reply.send({
        event: {
          title: event.title,
          startIn: event.startIn,
          endIn: event.endIn,
          totalLeads: event._count.leads,
        },
        timeline: result,
      });
    },
  );
}

function generateTimeSlots(start: Date, end: Date, intervalMinutes: number) {
  const result: string[] = [];

  let cursor = dayjs(start).startOf("minute");

  // Alinha para o intervalo exato (08:17 → 08:30)
  const minute = cursor.minute();
  const remainder = minute % intervalMinutes;

  if (remainder !== 0) {
    cursor = cursor.add(intervalMinutes - remainder, "minute");
  }

  while (cursor.isBefore(end)) {
    result.push(cursor.format("HH:mm"));
    cursor = cursor.add(intervalMinutes, "minute");
  }

  return result;
}

function getLeadSlot(date: Date, intervalMinutes: number) {
  const d = dayjs(date);
  const minute = d.minute();
  const remainder = minute % intervalMinutes;

  return d.subtract(remainder, "minute").startOf("minute").format("HH:mm");
}

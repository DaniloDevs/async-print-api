import dayjs from "dayjs";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../connections/prisma";

export async function OverviewMetrics(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/:eventSlug/metrics/overview",
    {
      schema: {
        summary: "Retrieve total leads",
        tags: ["Metrics"],
        description: "Returns the total number of leads.",
        params: z.object({
          eventSlug: z.string(),
        }),
        response: {
          200: z.object({
            metrics: z.object({
              // Card 1: Leads generated in the last hour
              leadsLastHour: z.object({
                value: z.number().int().nonnegative(),
                growthPercentage: z.number(),
                trend: z.enum(["up", "down"]),
                label: z.string(),
                status: z.string(),
              }),

              // Card 2: Total leads generated
              totalLeads: z.object({
                value: z.number().int().nonnegative(),
                retentionRate: z.number().nonnegative(),
                trend: z.enum(["up", "down"]),
                label: z.string(),
                status: z.string(),
              }),

              // Card 3: Conversions per hour (%)
              conversionsPerHour: z.object({
                value: z.number().nonnegative(),
                growthPercentage: z.number(),
                trend: z.enum(["up", "down"]),
                label: z.string(),
                status: z.string(),
              }),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { eventSlug } = request.params;

      const now = dayjs();
      const oneHourAgo = now.subtract(1, "hour").toDate();
      const twoHoursAgo = now.subtract(2, "hour").toDate();

      const [
        totalLeads,
        currentLeads,
        previousHour,
        totalConversions,
        currentConversions,
        previousConversions,
      ] = await Promise.all([
        // Leads na última hora
        prisma.leads.count({
          where: {
            events: { slug: eventSlug },
            createdAt: { gte: oneHourAgo },
          },
        }),

        // Total de leads (todos os tempos)
        prisma.leads.count({
          where: {
            events: { slug: eventSlug },
          },
        }),

        // Leads na hora anterior (2h atrás até 1h atrás)
        prisma.leads.count({
          where: {
            events: { slug: eventSlug },
            createdAt: {
              gte: twoHoursAgo,
              lt: oneHourAgo,
            },
          },
        }),

        // Conversões na última hora
        prisma.leads.count({
          where: {
            events: { slug: eventSlug },

            createdAt: { gte: oneHourAgo },
          },
        }),

        // Total de conversões
        prisma.leads.count({
          where: {
            events: { slug: eventSlug },
          },
        }),

        // Conversões na hora anterior
        prisma.leads.count({
          where: {
            events: { slug: eventSlug },

            createdAt: {
              gte: twoHoursAgo,
              lt: oneHourAgo,
            },
          },
        }),
      ]);

      // Cálculo do crescimento de leads
      const leadsGrowthPercentage =
        previousHour === 0
          ? currentLeads > 0
            ? 100
            : 0
          : ((currentLeads - previousHour) / previousHour) * 100;

      // Cálculo da taxa de conversão atual
      const currentConversionRate =
        currentLeads === 0 ? 0 : (currentConversions / currentLeads) * 100;

      // Cálculo da taxa de conversão anterior
      const previousConversionRate =
        previousHour === 0 ? 0 : (previousConversions / previousHour) * 100;

      // Crescimento da taxa de conversão
      const conversionGrowthPercentage =
        previousConversionRate === 0
          ? currentConversionRate > 0
            ? 100
            : 0
          : ((currentConversionRate - previousConversionRate) / previousConversionRate) * 100;

      // Taxa de retenção/engajamento total
      const totalRetentionRate = totalLeads === 0 ? 0 : (totalConversions / totalLeads) * 100;

      return reply.send({
        metrics: {
          // Card 1: Leads generated in the last hour
          leadsLastHour: {
            value: currentLeads,
            growthPercentage: Number(leadsGrowthPercentage.toFixed(2)),
            trend: leadsGrowthPercentage >= 0 ? "up" : "down",
            label:
              leadsGrowthPercentage < 0
                ? `Down ${Math.abs(leadsGrowthPercentage).toFixed(0)}% this period`
                : `Up ${leadsGrowthPercentage.toFixed(0)}% this period`,
            status:
              leadsGrowthPercentage < -10 ? "Acquisition needs attention" : "Performance on track",
          },

          // Card 2: Total leads generated
          totalLeads: {
            value: totalLeads,
            retentionRate: Number(totalRetentionRate.toFixed(2)),
            trend: "up",
            label:
              totalRetentionRate > 50 ? "Strong user retention" : "Engagement needs improvement",
            status: totalRetentionRate > 50 ? "Engagement exceed targets" : "Focus on retention",
          },

          // Card 3: Conversions per hour
          conversionsPerHour: {
            value: Number(currentConversionRate.toFixed(0)),
            growthPercentage: Number(conversionGrowthPercentage.toFixed(2)),
            trend: conversionGrowthPercentage >= 0 ? "up" : "down",
            label:
              conversionGrowthPercentage > 0
                ? "Steady performance increase"
                : "Performance declined",
            status:
              conversionGrowthPercentage > 0 ? "Meets growth projections" : "Below projections",
          },
        },
      });
    },
  );
}

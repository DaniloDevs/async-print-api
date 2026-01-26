import path from "node:path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { s3 } from "../../connections/minio";
import { prisma } from "../../connections/prisma";
import { env } from "../../env";

export async function UpdateEventBanner(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        "/events/:id/banner",
        {
            schema: {
                summary: "Update event banner image",
                tags: ["Events"],
                description:
                    "Uploads and associates a new banner image with the specified event. If a banner already exists, it will be overwritten by the new asset.",
                params: z.object({
                    id: z.string(),
                }),
                response: {
                    200: z.object({
                        message: z.string(),
                    }),
                    400: z.object({
                        message: z.string(),
                    }),
                    404: z.object({
                        message: z.string(),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params;

            const file = await request.file();
            if (!file)
                return reply.code(400).send({ message: "Banner obrigatório" });

            if (!file.mimetype.startsWith("image/")) {
                return reply
                    .code(400)
                    .send({ message: "Apenas imagens são permitidas" });
            }

            const event = await prisma.events.findUnique({ where: { id } });
            if (!event)
                return reply
                    .code(404)
                    .send({ message: "Evento não encontrado" });

            const buffer = await file.toBuffer();
            const ext = path.extname(file.filename);
            const filename = `${crypto.randomUUID()}${ext}`;

            // ------ UPLOAD MINIO ------
            await s3.send(
                new PutObjectCommand({
                    Bucket: env.MINIO_BUCKET,
                    Key: filename,
                    Body: buffer,
                    ContentType: file.mimetype,
                }),
            );

            await prisma.events.update({
                where: { id },
                data: { bannerURL: filename },
            });

            return reply.code(200).send({
                message: "Banner atualizado",
            });
        },
    );
}

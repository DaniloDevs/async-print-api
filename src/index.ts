import cors from "@fastify/cors";
import Multipart from "@fastify/multipart";
import fastifySwagger from "@fastify/swagger";
import fastifyScalar from "@scalar/fastify-api-reference";
import Fastify from "fastify";
import {
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
} from "fastify-type-provider-zod";
import { ZodError } from "zod";
import { env } from "./env";
import EventRoutes from "./http/controllers/event/_routes";
import LeadsRoutes from "./http/controllers/leads/_routes";

const app = Fastify();

app.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
});

// Add schema validator and serializer
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(Multipart, {
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
    },
});

app.register(fastifySwagger, {
    openapi: {
        info: {
            title: "Lead Print API",
            description: `
**Orquestrador de Captação de Leads e Impressão Térmica.**

Esta API gerencia o fluxo completo de eventos presenciais, desde o cadastro de participantes até a emissão física de comprovantes para sorteios.

### Módulos Principais:
* **Hardware Integration:** Controle direto de impressoras térmicas (USB/Serial).
* **Background Jobs:** Processamento assíncrono de filas (via BullMQ) para garantir alta disponibilidade.
* **Event Management:** Gestão de múltiplos eventos e seus respectivos leads.
         `,
            version: "1.0.0",
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}`,
                description: "Ambiente de Desenvolvimento (Local)",
            },
        ],
        tags: [
            {
                name: "Events",
                description:
                    "Gerenciamento do ciclo de vida dos eventos e configurações globais.",
            },
            {
                name: "Leads",
                description:
                    "Cadastro e consulta de participantes captados e validação de funil.",
            },
        ],
    },
    transform: jsonSchemaTransform,
});

app.register(fastifyScalar, {
    routePrefix: "/docs",
    configuration: {
        searchHotKey: "k",
        theme: "deepSpace",
        layout: "modern",
    },
});

app.register(EventRoutes);
app.register(LeadsRoutes);

app.setErrorHandler((error, _, reply) => {
    if (error instanceof ZodError) {
        return reply.status(400).send({
            message: "Validation error",
            issues: error.issues,
        });
    }

    return reply.status(500).send({
        message: "Internal server error",
        error: error.message,
    });
});

export { app };

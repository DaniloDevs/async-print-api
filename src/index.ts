import fastifyCookie from "@fastify/cookie";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import Multipart from "@fastify/multipart";
import fastifySwagger from "@fastify/swagger";
import fastifyScalar from "@scalar/fastify-api-reference";
import Fastify from "fastify";
import {
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
} from "fastify-type-provider-zod";
import { env } from "./env";
import { errorHandler } from "./error/handler";
import AuthRoutes from "./http/controllers/auth/_routes";
import EventRoutes from "./http/controllers/event/_routes";
import LeadsRoutes from "./http/controllers/leads/_routes";
import PrintersRoutes from "./http/controllers/printers/_routes";

const app = Fastify();

// === Security & Middleware ===
// Cookies antes do JWT
app.register(fastifyCookie);

app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    cookie: {
        cookieName: "refreshToken",
        signed: true,
    },
    sign: {
        expiresIn: "10m",
    },
});

// CORS restrito (em produção, não usar "*")
app.register(cors, {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
});

// Upload de arquivos (limitado)
app.register(Multipart, {
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

// Validators e Serializers
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// === Swagger ===
app.register(fastifySwagger, {
    openapi: {
        info: {
            title: "Lead Print API",
            description: `
**Orquestrador de Captação de Leads e Impressão Térmica.**
Esta API gerencia o fluxo completo de eventos presenciais, desde o cadastro de participantes até a emissão física de comprovantes para sorteios.
`,
            version: "1.0.0",
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}`,
                description: "Desenvolvimento Local",
            },
            // {
            //     url: "https://api.staging.asyncprint.com",
            //     description: "Ambiente de Staging",
            // },
            // {
            //     url: "https://api.asyncprint.com",
            //     description: "Ambiente de Produção",
            // },
        ],
        tags: [
            {
                name: "Events",
                description: "Gestão de eventos e configurações globais.",
            },
            { name: "Leads", description: "Cadastro e funil de leads." },
            {
                name: "Auth",
                description: "Autenticação e sessões de usuários.",
            },
            {
                name: "Printers",
                description: "Fila de impressão e gestão de impressoras.",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [{ bearerAuth: [] }],
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

// === Versionamento e Rotas ===
app.register(EventRoutes);
app.register(LeadsRoutes);
app.register(AuthRoutes);
app.register(PrintersRoutes);

// === Error Handling ===
app.setErrorHandler(errorHandler);

export { app };

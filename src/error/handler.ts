import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { AppError } from "../service/_errors/app-error";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
    if (error instanceof ZodError) {
        return reply.status(400).send({
            statusCode: 400,
            error: "ValidationError",
            message: "Validation error",
            details: error.issues,
        });
    }

    if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
            statusCode: error.statusCode,
            error: error.constructor.name,
            message: error.message,
        });
    }

    console.log(error);

    return reply.status(500).send({
        statusCode: 500,
        error: "InternalServerError",
        message: "Internal server error",
    });
};

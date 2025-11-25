import Fastify from "fastify";
import { env } from "./env";
import jobsRoute from "./routes/jobs";

const app = Fastify();


app.register(jobsRoute)


app.listen({ port: env.PORT, host: "0.0.0.0" }).then(() => {
   console.log(`API rodando na porta ${env.PORT}`);
});

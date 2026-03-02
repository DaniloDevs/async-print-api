import { app } from ".";
import { env } from "./env";

app.listen({ port: env.PORT, host: "0.0.0.0" }).then(() => {
    console.log(`
🚀 Server started successfully
    --> Docs:  http://localhost:${env.PORT}/docs
`);
});

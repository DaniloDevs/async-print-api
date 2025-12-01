import { Worker, type Job } from "bullmq";
import { env } from "../env";
import { getPrinter } from "../utils/setup-printer";
import type { Lead } from "../types/lead";
import path from "path";
import type { ThermalPrinter } from "node-thermal-printer";


async function TempleteTickt(printer: ThermalPrinter, job: Job<Lead>) {
   // Titulo 
   printer.alignCenter();
   printer.setTextNormal()
   printer.bold(true);
   printer.println("Ticket do Sorteio");
   printer.newLine();

   // Inserindo dados
   printer.alignLeft();
   printer.bold(false);
   printer.print("Participante: ")
   printer.bold(true);
   printer.println(job.data.name)
   printer.bold(false);
   printer.print("Final do Telefone: ")
   printer.bold(true);
   printer.println(job.data.cellphone.slice(-4))

   // Footer
   printer.newLine();
   printer.alignRight();
   printer.println(new Date().toLocaleString('pt-BR'))
   printer.cut()
}

new Worker(
   "leads-enqueue",
   async (job: Job<Lead>) => {
      const printer = getPrinter();

      await TempleteTickt(printer,job)

      await printer.execute();
      console.log("Executed Job")

   },
   {
      connection: {
         host: env.REDIS_HOST,
         port: env.REDIS_PORT,
      },
   }
);

console.log("Worker iniciado");
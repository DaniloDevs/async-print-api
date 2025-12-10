import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Worker, type Job } from "bullmq";
import { env } from "../env";
import { getPrinter } from "../utils/setup-printer";
import type { ThermalPrinter } from "node-thermal-printer";
import { s3 } from '../connections/minio';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import type { Ticket } from '../types/ticket';
import { getImageFromS3BySignedUrl } from '../utils/get-banner-url';


async function TempleteTickt(printer: ThermalPrinter, job: Job<Ticket>) {
   
   const localPath = await getImageFromS3BySignedUrl(job.data.bannerURL, s3)
   printer.alignCenter()
   
   await printer.printImageBuffer(localPath);

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
   async (job: Job<Ticket>) => {
      const printer = getPrinter();

      await TempleteTickt(printer, job)

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
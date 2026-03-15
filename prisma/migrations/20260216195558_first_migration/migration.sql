-- CreateEnum
CREATE TYPE "eventStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT', 'FINISHED', 'CANCELED');

-- CreateEnum
CREATE TYPE "leadTechnical" AS ENUM ('ENF', 'INF', 'ADM', 'NONE');

-- CreateEnum
CREATE TYPE "leadOringen" AS ENUM ('QRCODE', 'INSTAGRAM', 'MANUAL');

-- CreateEnum
CREATE TYPE "leadSegment" AS ENUM ('NONE', 'JARDIM_1', 'JARDIM_2', 'ANO_1_FUNDAMENTAL', 'ANO_2_FUNDAMENTAL', 'ANO_3_FUNDAMENTAL', 'ANO_4_FUNDAMENTAL', 'ANO_5_FUNDAMENTAL', 'ANO_6_FUNDAMENTAL', 'ANO_7_FUNDAMENTAL', 'ANO_8_FUNDAMENTAL', 'ANO_9_FUNDAMENTAL', 'ANO_1_MEDIO', 'ANO_2_MEDIO', 'ANO_3_MEDIO');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PrinterType" AS ENUM ('THERMAL', 'INKJET', 'LASER', 'PDF', 'NETWORK');

-- CreateEnum
CREATE TYPE "PrinterStatus" AS ENUM ('DISCONNECTED', 'CONNECTED', 'PRINTING');

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bannerKey" TEXT,
    "status" "eventStatus" NOT NULL DEFAULT 'DRAFT',
    "startAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "intentionNextYear" BOOLEAN NOT NULL DEFAULT true,
    "origin" "leadOringen" NOT NULL,
    "technical" "leadTechnical" NOT NULL,
    "segment" "leadSegment" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Printer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "description" TEXT,
    "type" "PrinterType" NOT NULL,
    "status" "PrinterStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "Printer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE INDEX "leads_eventId_idx" ON "leads"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "leads_email_eventId_key" ON "leads"("email", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "leads_phone_eventId_key" ON "leads"("phone", "eventId");

-- CreateIndex
CREATE INDEX "Job_status_createdAt_idx" ON "Job"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Printer_slug_key" ON "Printer"("slug");

-- CreateIndex
CREATE INDEX "Printer_eventId_idx" ON "Printer"("eventId");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Printer" ADD CONSTRAINT "Printer_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - Made the column `eventsId` on table `leads` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_eventsId_fkey";

-- AlterTable
ALTER TABLE "leads" ALTER COLUMN "eventsId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_eventsId_fkey" FOREIGN KEY ("eventsId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

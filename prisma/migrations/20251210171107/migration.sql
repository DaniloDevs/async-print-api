/*
  Warnings:

  - Changed the type of `createdAt` on the `events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `endIn` on the `events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `startIn` on the `events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `createdAt` on the `leads` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "endIn",
ADD COLUMN     "endIn" TIMESTAMP(3) NOT NULL,
DROP COLUMN "startIn",
ADD COLUMN     "startIn" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "leads" DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL;

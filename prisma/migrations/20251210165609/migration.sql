/*
  Warnings:

  - Added the required column `endIn` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startIn` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "endIn" TEXT NOT NULL,
ADD COLUMN     "startIn" TEXT NOT NULL;

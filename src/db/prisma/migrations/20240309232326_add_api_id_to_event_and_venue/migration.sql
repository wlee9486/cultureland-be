/*
  Warnings:

  - A unique constraint covering the columns `[apiId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[apiId]` on the table `Venue` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apiId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apiId` to the `Venue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "apiId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "apiId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Event_apiId_key" ON "Event"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_apiId_key" ON "Venue"("apiId");

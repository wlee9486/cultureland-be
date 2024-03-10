/*
  Warnings:

  - A unique constraint covering the columns `[status]` on the table `EventStatus` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EventStatus_status_key" ON "EventStatus"("status");

/*
  Warnings:

  - A unique constraint covering the columns `[provider]` on the table `Provider` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Provider_provider_key" ON "Provider"("provider");

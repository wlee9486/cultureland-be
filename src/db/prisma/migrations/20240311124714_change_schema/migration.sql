/*
  Warnings:

  - You are about to drop the column `status` on the `EventStatus` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[value]` on the table `Area` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[value]` on the table `EventStatus` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `value` to the `Area` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `EventStatus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `EventStatus` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Area_name_key";

-- DropIndex
DROP INDEX "EventStatus_status_key";

-- AlterTable
ALTER TABLE "Area" ADD COLUMN     "value" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EventStatus" DROP COLUMN "status",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "value" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Area_value_key" ON "Area"("value");

-- CreateIndex
CREATE UNIQUE INDEX "EventStatus_value_key" ON "EventStatus"("value");

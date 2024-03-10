/*
  Warnings:

  - You are about to drop the column `area` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `area` on the `Venue` table. All the data in the column will be lost.
  - Added the required column `areaCode` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "area",
ADD COLUMN     "areaCode" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Venue" DROP COLUMN "area";

-- CreateTable
CREATE TABLE "Area" (
    "code" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("code")
);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_areaCode_fkey" FOREIGN KEY ("areaCode") REFERENCES "Area"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

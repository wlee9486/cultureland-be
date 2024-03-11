/*
  Warnings:

  - You are about to drop the `UserEvents` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[eventId,name]` on the table `BookingLink` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[value]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `BookingLink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserEvents" DROP CONSTRAINT "UserEvents_eventId_fkey";

-- DropForeignKey
ALTER TABLE "UserEvents" DROP CONSTRAINT "UserEvents_userId_fkey";

-- AlterTable
ALTER TABLE "BookingLink" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "description" TEXT NOT NULL;

-- DropTable
DROP TABLE "UserEvents";

-- CreateTable
CREATE TABLE "UserAttendedEvents" (
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "receiptImage" TEXT NOT NULL,

    CONSTRAINT "UserAttendedEvents_pkey" PRIMARY KEY ("userId","eventId")
);

-- CreateTable
CREATE TABLE "UserInterestedEvents" (
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "UserInterestedEvents_pkey" PRIMARY KEY ("userId","eventId")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingLink_eventId_name_key" ON "BookingLink"("eventId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_value_key" ON "Category"("value");

-- AddForeignKey
ALTER TABLE "UserAttendedEvents" ADD CONSTRAINT "UserAttendedEvents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAttendedEvents" ADD CONSTRAINT "UserAttendedEvents_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterestedEvents" ADD CONSTRAINT "UserInterestedEvents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterestedEvents" ADD CONSTRAINT "UserInterestedEvents_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

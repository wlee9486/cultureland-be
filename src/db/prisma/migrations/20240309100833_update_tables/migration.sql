/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `Review` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reviewerId,eventId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `image` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Made the column `profileImage` on table `UserProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Review" DROP COLUMN "imageUrl",
DROP COLUMN "isVerified",
ADD COLUMN     "image" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserProfile" ALTER COLUMN "profileImage" SET NOT NULL;

-- CreateTable
CREATE TABLE "Follow" (
    "followerId" INTEGER NOT NULL,
    "followingId" INTEGER NOT NULL,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("followerId","followingId")
);

-- CreateTable
CREATE TABLE "UserEvents" (
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "receiptImage" TEXT NOT NULL,

    CONSTRAINT "UserEvents_pkey" PRIMARY KEY ("userId","eventId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_reviewerId_eventId_key" ON "Review"("reviewerId", "eventId");

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEvents" ADD CONSTRAINT "UserEvents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

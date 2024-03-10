/*
  Warnings:

  - You are about to drop the column `isVerified` on the `UserEvents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UserEvents" DROP COLUMN "isVerified";

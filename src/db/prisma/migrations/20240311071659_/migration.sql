/*
  Warnings:

  - You are about to drop the `_CategoryToEvent` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryCode` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_CategoryToEvent" DROP CONSTRAINT "_CategoryToEvent_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToEvent" DROP CONSTRAINT "_CategoryToEvent_B_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "categoryCode" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_CategoryToEvent";

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_categoryCode_fkey" FOREIGN KEY ("categoryCode") REFERENCES "Category"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

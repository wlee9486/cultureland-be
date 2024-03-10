-- DropForeignKey
ALTER TABLE "BookingLink" DROP CONSTRAINT "BookingLink_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventDescriptionImage" DROP CONSTRAINT "EventDescriptionImage_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventDetail" DROP CONSTRAINT "EventDetail_eventId_fkey";

-- AlterTable
ALTER TABLE "BookingLink" ALTER COLUMN "eventId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDetail" ADD CONSTRAINT "EventDetail_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDescriptionImage" ADD CONSTRAINT "EventDescriptionImage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "EventDetail"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingLink" ADD CONSTRAINT "BookingLink_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "EventDetail"("eventId") ON DELETE SET NULL ON UPDATE CASCADE;

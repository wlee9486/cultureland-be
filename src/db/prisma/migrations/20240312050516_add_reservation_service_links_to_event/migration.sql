-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "reservationServiceLinks" JSONB[] DEFAULT ARRAY[]::JSONB[];

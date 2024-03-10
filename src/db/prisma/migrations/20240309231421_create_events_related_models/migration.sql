-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "partnerId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "poster" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "venueId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventDetail" (
    "eventId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "genre" TEXT NOT NULL,
    "runtime" TEXT NOT NULL,
    "timeInfo" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "eventStatusCode" INTEGER NOT NULL,

    CONSTRAINT "EventDetail_pkey" PRIMARY KEY ("eventId")
);

-- CreateTable
CREATE TABLE "EventStatus" (
    "code" SERIAL NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "EventStatus_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "EventDescriptionImage" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "EventDescriptionImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "code" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "BookingLink" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "link" TEXT NOT NULL,

    CONSTRAINT "BookingLink_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserEvents" ADD CONSTRAINT "UserEvents_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDetail" ADD CONSTRAINT "EventDetail_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDetail" ADD CONSTRAINT "EventDetail_eventStatusCode_fkey" FOREIGN KEY ("eventStatusCode") REFERENCES "EventStatus"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDescriptionImage" ADD CONSTRAINT "EventDescriptionImage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "EventDetail"("eventId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingLink" ADD CONSTRAINT "BookingLink_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "EventDetail"("eventId") ON DELETE RESTRICT ON UPDATE CASCADE;

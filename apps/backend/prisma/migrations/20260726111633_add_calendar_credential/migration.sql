-- CreateTable
CREATE TABLE "public"."CalendarCredential" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "refreshToken" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarCredential_pkey" PRIMARY KEY ("id")
);

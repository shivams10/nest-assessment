-- CreateTable
CREATE TABLE "public"."InterviewerCalendarCredential" (
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewerCalendarCredential_pkey" PRIMARY KEY ("userId")
);

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('added', 'interview_scheduled', 'interview_done', 'next_round', 'on_hold', 'rejected', 'hired');

-- CreateEnum
CREATE TYPE "InterviewSessionStatus" AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "InterviewQuestionType" AS ENUM ('mcq_single', 'mcq_multi', 'subjective', 'coding');

-- CreateEnum
CREATE TYPE "InterviewQuestionSource" AS ENUM ('ai_generated', 'manual');

-- CreateEnum
CREATE TYPE "InterviewRecommendation" AS ENUM ('strong_hire', 'hire', 'no_hire', 'strong_no_hire');

-- CreateEnum
CREATE TYPE "HiringDecisionType" AS ENUM ('next_round', 'on_hold', 'rejected', 'hired');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'recruiter';
ALTER TYPE "UserRole" ADD VALUE 'interviewer';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "invitedAt" TIMESTAMP(3),
ADD COLUMN     "invitedBy" TEXT;

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "roleApplyingFor" TEXT NOT NULL,
    "yearsOfExperience" INTEGER,
    "skills" JSONB NOT NULL DEFAULT '[]',
    "education" JSONB NOT NULL DEFAULT '[]',
    "resumeUrl" TEXT,
    "referredBy" TEXT,
    "status" "CandidateStatus" NOT NULL DEFAULT 'added',
    "addedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingRoom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "resourceEmail" TEXT NOT NULL,
    "location" TEXT,
    "capacity" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewSession" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "scheduledById" TEXT NOT NULL,
    "roomId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "meetLink" TEXT,
    "googleCalendarEventId" TEXT,
    "status" "InterviewSessionStatus" NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionQuestion" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "type" "InterviewQuestionType" NOT NULL,
    "difficulty" "QuestionDifficulty" NOT NULL DEFAULT 'medium',
    "tags" JSONB NOT NULL DEFAULT '[]',
    "options" JSONB,
    "exampleInput" TEXT,
    "exampleOutput" TEXT,
    "source" "InterviewQuestionSource" NOT NULL DEFAULT 'manual',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SessionQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionLink" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionNote" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionFeedback" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "problemSolvingRating" INTEGER NOT NULL,
    "codeQualityRating" INTEGER NOT NULL,
    "communicationRating" INTEGER NOT NULL,
    "systemDesignRating" INTEGER NOT NULL,
    "recommendation" "InterviewRecommendation" NOT NULL,
    "notes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiringDecision" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "decidedBy" TEXT NOT NULL,
    "decision" "HiringDecisionType" NOT NULL,
    "notes" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HiringDecision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_email_key" ON "Candidate"("email");

-- CreateIndex
CREATE INDEX "Candidate_status_idx" ON "Candidate"("status");

-- CreateIndex
CREATE INDEX "Candidate_addedBy_idx" ON "Candidate"("addedBy");

-- CreateIndex
CREATE INDEX "Candidate_email_idx" ON "Candidate"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingRoom_resourceEmail_key" ON "MeetingRoom"("resourceEmail");

-- CreateIndex
CREATE INDEX "MeetingRoom_isActive_idx" ON "MeetingRoom"("isActive");

-- CreateIndex
CREATE INDEX "InterviewSession_candidateId_idx" ON "InterviewSession"("candidateId");

-- CreateIndex
CREATE INDEX "InterviewSession_interviewerId_idx" ON "InterviewSession"("interviewerId");

-- CreateIndex
CREATE INDEX "InterviewSession_scheduledById_idx" ON "InterviewSession"("scheduledById");

-- CreateIndex
CREATE INDEX "InterviewSession_status_idx" ON "InterviewSession"("status");

-- CreateIndex
CREATE INDEX "InterviewSession_scheduledAt_idx" ON "InterviewSession"("scheduledAt");

-- CreateIndex
CREATE INDEX "SessionQuestion_sessionId_idx" ON "SessionQuestion"("sessionId");

-- CreateIndex
CREATE INDEX "SessionQuestion_order_idx" ON "SessionQuestion"("order");

-- CreateIndex
CREATE UNIQUE INDEX "SessionLink_sessionId_key" ON "SessionLink"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionLink_token_key" ON "SessionLink"("token");

-- CreateIndex
CREATE INDEX "SessionLink_token_idx" ON "SessionLink"("token");

-- CreateIndex
CREATE UNIQUE INDEX "SessionNote_sessionId_key" ON "SessionNote"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionFeedback_sessionId_key" ON "SessionFeedback"("sessionId");

-- CreateIndex
CREATE INDEX "SessionFeedback_interviewerId_idx" ON "SessionFeedback"("interviewerId");

-- CreateIndex
CREATE INDEX "HiringDecision_candidateId_idx" ON "HiringDecision"("candidateId");

-- CreateIndex
CREATE INDEX "HiringDecision_decidedBy_idx" ON "HiringDecision"("decidedBy");

-- CreateIndex
CREATE INDEX "User_invitedBy_idx" ON "User"("invitedBy");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_scheduledById_fkey" FOREIGN KEY ("scheduledById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "MeetingRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionQuestion" ADD CONSTRAINT "SessionQuestion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionQuestion" ADD CONSTRAINT "SessionQuestion_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionLink" ADD CONSTRAINT "SessionLink_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionNote" ADD CONSTRAINT "SessionNote_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionFeedback" ADD CONSTRAINT "SessionFeedback_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionFeedback" ADD CONSTRAINT "SessionFeedback_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiringDecision" ADD CONSTRAINT "HiringDecision_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiringDecision" ADD CONSTRAINT "HiringDecision_decidedBy_fkey" FOREIGN KEY ("decidedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

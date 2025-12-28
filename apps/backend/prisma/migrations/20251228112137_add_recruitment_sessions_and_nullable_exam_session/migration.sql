-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_collegeSessionId_fkey";

-- DropForeignKey
ALTER TABLE "RecruitmentSession" DROP CONSTRAINT "RecruitmentSession_collegeId_fkey";

-- AlterTable
ALTER TABLE "Exam" ALTER COLUMN "collegeSessionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RecruitmentSession" ALTER COLUMN "collegeId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "RecruitmentSession_createdAt_idx" ON "RecruitmentSession"("createdAt");

-- AddForeignKey
ALTER TABLE "RecruitmentSession" ADD CONSTRAINT "RecruitmentSession_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_collegeSessionId_fkey" FOREIGN KEY ("collegeSessionId") REFERENCES "RecruitmentSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

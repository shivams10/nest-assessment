-- AlterTable
ALTER TABLE "FinalResult" ADD COLUMN     "rank" INTEGER;

-- CreateIndex
CREATE INDEX "Exam_collegeSessionId_idx" ON "Exam"("collegeSessionId");

-- CreateIndex
CREATE INDEX "Exam_isPublished_idx" ON "Exam"("isPublished");

-- CreateIndex
CREATE INDEX "ExamSet_examId_idx" ON "ExamSet"("examId");

-- CreateIndex
CREATE INDEX "FinalResult_rank_idx" ON "FinalResult"("rank");

-- CreateIndex
CREATE INDEX "FinalResult_selectedForNextRound_idx" ON "FinalResult"("selectedForNextRound");

-- CreateIndex
CREATE INDEX "FinalResult_submissionId_rank_idx" ON "FinalResult"("submissionId", "rank");

-- CreateIndex
CREATE INDEX "RecruitmentSession_collegeId_idx" ON "RecruitmentSession"("collegeId");

-- CreateIndex
CREATE INDEX "RecruitmentSession_status_idx" ON "RecruitmentSession"("status");

-- CreateIndex
CREATE INDEX "RecruitmentSession_createdBy_idx" ON "RecruitmentSession"("createdBy");

-- CreateIndex
CREATE INDEX "Submission_examId_idx" ON "Submission"("examId");

-- CreateIndex
CREATE INDEX "Submission_userId_idx" ON "Submission"("userId");

-- CreateIndex
CREATE INDEX "Submission_submittedAt_idx" ON "Submission"("submittedAt");

-- CreateIndex
CREATE INDEX "SubmissionAnswer_submissionScoreId_idx" ON "SubmissionAnswer"("submissionScoreId");

-- CreateIndex
CREATE INDEX "SubmissionScore_submissionId_idx" ON "SubmissionScore"("submissionId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_collegeSessionId_idx" ON "User"("collegeSessionId");

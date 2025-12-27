/*
  Warnings:

  - A unique constraint covering the columns `[submissionId,questionId]` on the table `SubmissionScore` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SubmissionScore_submissionId_questionId_key" ON "SubmissionScore"("submissionId", "questionId");

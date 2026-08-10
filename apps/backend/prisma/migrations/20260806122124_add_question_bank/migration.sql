-- CreateTable
CREATE TABLE "public"."QuestionBankItem" (
    "id" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "type" "public"."InterviewQuestionType" NOT NULL,
    "difficulty" "public"."QuestionDifficulty" NOT NULL DEFAULT 'medium',
    "source" "public"."InterviewQuestionSource" NOT NULL DEFAULT 'manual',
    "prompt" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "options" JSONB,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "QuestionBankItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuestionBankTestCase" (
    "id" TEXT NOT NULL,
    "questionBankItemId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuestionBankTestCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionBankItem_tags_idx" ON "public"."QuestionBankItem" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "QuestionBankItem_updatedBy_idx" ON "public"."QuestionBankItem"("updatedBy");

-- CreateIndex
CREATE INDEX "QuestionBankItem_type_idx" ON "public"."QuestionBankItem"("type");

-- CreateIndex
CREATE INDEX "QuestionBankItem_difficulty_idx" ON "public"."QuestionBankItem"("difficulty");

-- CreateIndex
CREATE INDEX "QuestionBankItem_createdBy_idx" ON "public"."QuestionBankItem"("createdBy");

-- CreateIndex
CREATE INDEX "QuestionBankTestCase_questionBankItemId_idx" ON "public"."QuestionBankTestCase"("questionBankItemId");

-- AddForeignKey
ALTER TABLE "public"."QuestionBankItem" ADD CONSTRAINT "QuestionBankItem_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionBankItem" ADD CONSTRAINT "QuestionBankItem_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionBankTestCase" ADD CONSTRAINT "QuestionBankTestCase_questionBankItemId_fkey" FOREIGN KEY ("questionBankItemId") REFERENCES "public"."QuestionBankItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

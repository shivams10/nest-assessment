import { z } from 'zod'

/**
 * Exam Answer Schema
 * Validation for exam answer submissions
 */

export const examAnswerSchema = z.object({
  questionId: z.string().uuid('Question ID must be a valid UUID'),
  selectedOptionIds: z
    .array(z.string().uuid('Option ID must be a valid UUID'))
    .min(1, 'At least one option must be selected'),
})

export const submitAnswersSchema = z.object({
  submissionId: z.string().uuid('Submission ID must be a valid UUID'),
  answers: z.array(examAnswerSchema).min(1, 'At least one answer is required'),
})

export type ExamAnswer = z.infer<typeof examAnswerSchema>
export type SubmitAnswers = z.infer<typeof submitAnswersSchema>


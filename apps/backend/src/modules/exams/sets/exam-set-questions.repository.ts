import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ExamSetQuestionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  countBySection(sectionId: string) {
    return this.prisma.examSetQuestion.count({
      where: { examSetSectionId: sectionId },
    });
  }

  findExisting(sectionId: string, questionIds: string[]) {
    return this.prisma.examSetQuestion.findMany({
      where: {
        examSetSectionId: sectionId,
        questionId: { in: questionIds },
      },
      select: { questionId: true },
    });
  }

  addMany(sectionId: string, questionIds: string[]) {
    return this.prisma.examSetQuestion.createMany({
      data: questionIds.map((questionId) => ({
        examSetSectionId: sectionId,
        questionId,
      })),
      skipDuplicates: true,
    });
  }

  async findAssignedQuestions(sectionId: string) {
    const examSetQuestions = await this.prisma.examSetQuestion.findMany({
      where: { examSetSectionId: sectionId },
      include: {
        question: {
          include: {
            options: {
              select: {
                id: true,
                optionText: true,
                isCorrect: true,
              },
            },
          },
        },
      },
    });

    return examSetQuestions.map((eq) => ({
      id: eq.question.id,
      stem: eq.question.stem,
      type: eq.question.type,
      category: eq.question.category,
      points: eq.question.points,
      options: eq.question.options,
      createdAt: eq.question.createdAt,
    }));
  }

  async findAvailableQuestions(
    sectionType: 'aptitude' | 'technical',
    excludeSectionId: string,
  ) {
    // Get all question IDs already assigned to this section
    const assignedQuestionIds = await this.prisma.examSetQuestion.findMany({
      where: { examSetSectionId: excludeSectionId },
      select: { questionId: true },
    });

    const assignedIds = assignedQuestionIds.map((aq) => aq.questionId);

    // Find questions of the same category that are not assigned
    const questions = await this.prisma.question.findMany({
      where: {
        category: sectionType,
        deletedAt: null,
        ...(assignedIds.length > 0 && {
          id: { notIn: assignedIds },
        }),
      },
      include: {
        options: {
          select: {
            id: true,
            optionText: true,
            isCorrect: true,
          },
        },
      },
    });

    return questions.map((q) => ({
      id: q.id,
      stem: q.stem,
      type: q.type,
      category: q.category,
      points: q.points,
      options: q.options,
      createdAt: q.createdAt,
    }));
  }
}

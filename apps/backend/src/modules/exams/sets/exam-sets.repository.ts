import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

const EXAM_SET_PUBLIC_SELECT = {
  id: true,
  name: true,
  examId: true,
  createdAt: true,
} as const;

const EXAM_SET_SECTION_PUBLIC_SELECT = {
  id: true,
  sectionType: true,
  questionCount: true,
  examSetId: true,
} as const;

@Injectable()
export class ExamSetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByExam(examId: string) {
    const examSets = await this.prisma.examSet.findMany({
      where: { examId },
      include: {
        sections: {
          select: {
            id: true,
            sectionType: true,
            questionCount: true,
            examSetId: true,
          },
        },
      },
    });

    // Calculate assignedQuestionsCount for each section
    const examSetsWithCounts = await Promise.all(
      examSets.map(async (set) => {
        const sectionsWithCounts = await Promise.all(
          set.sections.map(async (section) => {
            const assignedCount = await this.prisma.examSetQuestion.count({
              where: { examSetSectionId: section.id },
            });

            return {
              ...section,
              assignedQuestionsCount: assignedCount,
            };
          }),
        );

        return {
          ...set,
          sections: sectionsWithCounts,
        };
      }),
    );

    return {
      items: examSetsWithCounts,
      total: examSetsWithCounts.length,
    };
  }

  createSet(examId: string, name: string) {
    return this.prisma.examSet.create({
      data: {
        name,
        exam: { connect: { id: examId } },
      },
      select: EXAM_SET_PUBLIC_SELECT,
    });
  }

  softDelete(setId: string) {
    return this.prisma.examSet.delete({
      where: { id: setId },
    });
  }

  createSection(
    examSetId: string,
    sectionType: 'aptitude' | 'technical',
    questionCount: number,
  ) {
    return this.prisma.examSetSection.create({
      data: {
        sectionType,
        questionCount,
        examSet: { connect: { id: examSetId } },
      },
      select: EXAM_SET_SECTION_PUBLIC_SELECT,
    });
  }

  updateSection(sectionId: string, questionCount: number) {
    return this.prisma.examSetSection.update({
      where: { id: sectionId },
      data: { questionCount },
      select: EXAM_SET_SECTION_PUBLIC_SELECT,
    });
  }
}

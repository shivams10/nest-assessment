import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ExamRuntimeRepository {
  constructor(private readonly prisma: PrismaService) {}

  findSubmission(
    submissionId: string,
    userId: string,
  ): Promise<{
    id: string;
    examSetId: string;
    startedAt: Date | null;
    submittedAt: Date | null;
    exam: {
      durationSeconds: number;
    };
  } | null> {
    return this.prisma.submission.findFirst({
      where: {
        id: submissionId,
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        examSetId: true,
        startedAt: true,
        submittedAt: true,
        exam: {
          select: {
            durationSeconds: true,
          },
        },
      },
    });
  }

  getExamSetStructure(examSetId: string): Promise<{
    id: string;
    name: string;
    sections: Array<{
      id: string;
      sectionType: string;
      questionCount: number;
      questions: Array<{
        question: {
          id: string;
          stem: string;
          type: string;
          category: string;
          options: Array<{ id: string; optionText: string }>;
        };
      }>;
    }>;
  } | null> {
    return this.prisma.examSet.findUnique({
      where: { id: examSetId },
      select: {
        id: true,
        name: true,
        sections: {
          orderBy: { sectionType: 'asc' },
          select: {
            id: true,
            sectionType: true,
            questionCount: true,
            questions: {
              select: {
                question: {
                  select: {
                    id: true,
                    stem: true,
                    type: true,
                    category: true,
                    options: {
                      select: {
                        id: true,
                        optionText: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}

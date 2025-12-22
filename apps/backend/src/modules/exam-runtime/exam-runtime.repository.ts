import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ExamRuntimeRepository {
  constructor(private readonly prisma: PrismaService) {}

  findSubmission(submissionId: string, userId: string) {
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
      },
    });
  }

  getExamSetStructure(examSetId: string) {
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

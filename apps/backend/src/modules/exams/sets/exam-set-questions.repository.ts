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
}

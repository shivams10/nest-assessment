import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ExamSetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createSet(examId: string, name: string) {
    return this.prisma.examSet.create({
      data: {
        name,
        exam: { connect: { id: examId } },
      },
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
    });
  }
}

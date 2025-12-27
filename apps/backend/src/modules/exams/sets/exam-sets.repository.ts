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
  createdAt: true,
} as const;

@Injectable()
export class ExamSetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createSet(examId: string, name: string) {
    return this.prisma.examSet.create({
      data: {
        name,
        exam: { connect: { id: examId } },
      },
      select: EXAM_SET_PUBLIC_SELECT,
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
}

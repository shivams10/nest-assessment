import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExamRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch a single exam (excluding soft-deleted)
   */
  findById(id: string) {
    return this.prisma.exam.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  /**
   * Fetch published exams for a recruitment session
   */
  findPublishedBySession(collegeSessionId: string) {
    return this.prisma.exam.findMany({
      where: {
        collegeSessionId,
        isPublished: true,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Create a new exam
   */
  create(data: Prisma.ExamCreateInput) {
    return this.prisma.exam.create({ data });
  }

  /**
   * Publish an exam
   */
  publish(examId: string) {
    return this.prisma.exam.update({
      where: { id: examId },
      data: { isPublished: true },
    });
  }

  /**
   * Soft delete
   */
  softDelete(examId: string) {
    return this.prisma.exam.update({
      where: { id: examId },
      data: { deletedAt: new Date() },
    });
  }
}

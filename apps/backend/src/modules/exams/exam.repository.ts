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

  create(data: Prisma.ExamCreateInput) {
    return this.prisma.exam.create({
      data,
      select: {
        id: true,
        title: true,
        description: true,
        windowStartsAt: true,
        windowEndsAt: true,
        durationSeconds: true,
        isPublished: true,
        createdAt: true,
      },
    });
  }

  async findForAdmin(filters: {
    collegeSessionId?: string;
    isPublished?: boolean;
    skip: number;
    take: number;
  }) {
    const { collegeSessionId, isPublished, skip, take } = filters;

    const where = {
      deletedAt: null,
      ...(collegeSessionId && { collegeSessionId }),
      ...(typeof isPublished === 'boolean' && { isPublished }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.exam.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          title: true,
          isPublished: true,
          windowStartsAt: true,
          windowEndsAt: true,
          durationSeconds: true,
          createdAt: true,
        },
      }),
      this.prisma.exam.count({ where }),
    ]);

    return { items, total };
  }

  unpublish(id: string) {
    return this.prisma.exam.update({
      where: { id },
      data: { isPublished: false },
    });
  }
}

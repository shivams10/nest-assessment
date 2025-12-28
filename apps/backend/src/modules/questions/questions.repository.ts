import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Prisma, QuestionCategory, QuestionType } from '@prisma/client';

const QUESTION_PUBLIC_SELECT = {
  id: true,
  stem: true,
  type: true,
  category: true,
  points: true,
  createdAt: true,
  options: {
    select: {
      id: true,
      optionText: true,
      isCorrect: true,
    },
  },
} as const;

@Injectable()
export class QuestionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(filters: {
    category?: QuestionCategory;
    type?: QuestionType;
    search?: string;
    skip: number;
    take: number;
  }) {
    const { category, type, search, skip, take } = filters;

    const where: Prisma.QuestionWhereInput = {
      deletedAt: null,
      ...(category && { category }),
      ...(type && { type }),
      ...(search && {
        stem: {
          contains: search,
          mode: 'insensitive',
        },
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.question.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: QUESTION_PUBLIC_SELECT,
      }),
      this.prisma.question.count({ where }),
    ]);

    return { items, total };
  }

  findById(id: string) {
    return this.prisma.question.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: QUESTION_PUBLIC_SELECT,
    });
  }

  async create(
    data: {
      stem: string;
      type: QuestionType;
      category: QuestionCategory;
      createdBy: string;
      options: { optionText: string; isCorrect: boolean }[];
    },
  ) {
    const { options, createdBy, ...questionData } = data;

    return this.prisma.question.create({
      data: {
        ...questionData,
        createdBy,
        options: {
          create: options,
        },
      },
      select: QUESTION_PUBLIC_SELECT,
    });
  }

  async update(
    id: string,
    data: {
      stem?: string;
      type?: QuestionType;
      category?: QuestionCategory;
      options?: { optionText: string; isCorrect: boolean }[];
    },
  ) {
    const { options, ...updateData } = data;

    // If options are provided, delete existing and create new ones
    if (options) {
      await this.prisma.questionOption.deleteMany({
        where: { questionId: id },
      });
    }

    return this.prisma.question.update({
      where: { id },
      data: {
        ...updateData,
        ...(options && {
          options: {
            create: options,
          },
        }),
      },
      select: QUESTION_PUBLIC_SELECT,
    });
  }

  softDelete(id: string) {
    return this.prisma.question.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}


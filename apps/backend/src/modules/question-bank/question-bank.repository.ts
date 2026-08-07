import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import {
  InterviewQuestionType,
  Prisma,
  QuestionDifficulty,
} from '@prisma/client';
import {
  QUESTION_BANK_DETAIL_SELECT,
  QUESTION_BANK_LIST_SELECT,
} from './constants/question-bank.select';

@Injectable()
export class QuestionBankRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(filters: {
    tags?: string[];
    type?: InterviewQuestionType;
    difficulty?: QuestionDifficulty;
    search?: string;
    skip: number;
    take: number;
  }) {
    const { tags, type, difficulty, search, skip, take } = filters;

    const where: Prisma.QuestionBankItemWhereInput = {
      deletedAt: null,
      ...(tags && tags.length > 0 && { tags: { hasSome: tags } }),
      ...(type && { type }),
      ...(difficulty && { difficulty }),
      ...(search && {
        prompt: { contains: search, mode: 'insensitive' },
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.questionBankItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: QUESTION_BANK_LIST_SELECT,
      }),
      this.prisma.questionBankItem.count({ where }),
    ]);

    return { items, total };
  }

  findById(id: string) {
    return this.prisma.questionBankItem.findFirst({
      where: { id, deletedAt: null },
      select: QUESTION_BANK_DETAIL_SELECT,
    });
  }

  create(data: {
    tags: string[];
    type: InterviewQuestionType;
    difficulty: QuestionDifficulty;
    prompt: string;
    points: number;
    createdBy: string;
    options?: { text: string; isCorrect: boolean }[];
    testCases?: {
      input: string;
      expectedOutput: string;
      isHidden: boolean;
      weight: number;
    }[];
  }) {
    const { options, testCases, ...rest } = data;

    return this.prisma.questionBankItem.create({
      data: {
        ...rest,
        ...(options && { options }),
        ...(testCases && {
          testCases: {
            create: testCases.map((testCase, order) => ({
              ...testCase,
              order,
            })),
          },
        }),
      },
      select: QUESTION_BANK_DETAIL_SELECT,
    });
  }

  async update(
    id: string,
    data: {
      tags?: string[];
      difficulty?: QuestionDifficulty;
      prompt?: string;
      points?: number;
      updatedBy: string;
      options?: { text: string; isCorrect: boolean }[];
      testCases?: {
        input: string;
        expectedOutput: string;
        isHidden: boolean;
        weight: number;
      }[];
    },
  ) {
    const { testCases, ...rest } = data;

    if (testCases) {
      await this.prisma.questionBankTestCase.deleteMany({
        where: { questionBankItemId: id },
      });
    }

    return this.prisma.questionBankItem.update({
      where: { id },
      data: {
        ...rest,
        ...(testCases && {
          testCases: {
            create: testCases.map((testCase, order) => ({
              ...testCase,
              order,
            })),
          },
        }),
      },
      select: QUESTION_BANK_DETAIL_SELECT,
    });
  }

  softDelete(id: string, deletedBy: string) {
    return this.prisma.questionBankItem.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: deletedBy },
      select: { id: true },
    });
  }

  allTags() {
    return this.prisma.questionBankItem.findMany({
      where: { deletedAt: null },
      select: { tags: true },
    });
  }
}

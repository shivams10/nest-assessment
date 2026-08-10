import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InterviewQuestionType } from '@prisma/client';
import { QuestionBankRepository } from './question-bank.repository';
import { CreateQuestionBankItemDto } from './dto/create-question-bank-item.dto';
import { UpdateQuestionBankItemDto } from './dto/update-question-bank-item.dto';
import { ListQuestionBankDto } from './dto/list-question-bank.dto';

@Injectable()
export class QuestionBankService {
  constructor(private readonly repository: QuestionBankRepository) {}

  async list(dto: ListQuestionBankDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;

    const result = await this.repository.findMany({
      tags: dto.tags,
      type: dto.type,
      difficulty: dto.difficulty,
      search: dto.search,
      skip,
      take: limit,
    });

    return {
      items: result.items,
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  // Tags are stored lowercase and trimmed so "React" and "react" are one tag.
  private normalizeTags(tags: string[]) {
    const seen = new Set<string>();

    for (const tag of tags) {
      const normalized = tag.trim().toLowerCase();
      if (normalized) {
        seen.add(normalized);
      }
    }

    return [...seen];
  }

  // Every distinct tag in use, for filter chips and add-question autocomplete.
  async tags() {
    const rows = await this.repository.allTags();
    const unique = new Set(rows.flatMap((row) => row.tags));

    return [...unique].sort((a, b) => a.localeCompare(b));
  }

  async findById(id: string) {
    const item = await this.repository.findById(id);

    if (!item) {
      throw new NotFoundException('Question bank item not found');
    }

    return item;
  }

  private validateMcqOptions(
    type: InterviewQuestionType,
    options: { text: string; isCorrect: boolean }[],
  ) {
    if (options.length < 2) {
      throw new BadRequestException(
        'MCQ questions must have at least 2 options',
      );
    }

    const correctCount = options.filter((option) => option.isCorrect).length;

    if (type === 'mcq_single' && correctCount !== 1) {
      throw new BadRequestException(
        'Single-select MCQ must have exactly one correct option',
      );
    }

    if (type === 'mcq_multi' && correctCount < 1) {
      throw new BadRequestException(
        'Multi-select MCQ must have at least one correct option',
      );
    }
  }

  async create(dto: CreateQuestionBankItemDto, createdBy: string) {
    const isMcq = dto.type === 'mcq_single' || dto.type === 'mcq_multi';

    if (isMcq) {
      this.validateMcqOptions(dto.type, dto.options ?? []);
    }

    if (dto.type === 'coding' && (!dto.testCases || dto.testCases.length < 1)) {
      throw new BadRequestException(
        'Coding questions must have at least one test case',
      );
    }

    return this.repository.create({
      tags: this.normalizeTags(dto.tags),
      type: dto.type,
      difficulty: dto.difficulty ?? 'medium',
      prompt: dto.prompt,
      points: dto.points ?? 1,
      createdBy,
      options: isMcq ? dto.options : undefined,
      testCases:
        dto.type === 'coding'
          ? dto.testCases!.map((testCase) => ({
              input: testCase.input,
              expectedOutput: testCase.expectedOutput,
              isHidden: testCase.isHidden ?? false,
              weight: testCase.weight ?? 1,
            }))
          : undefined,
    });
  }

  async update(id: string, dto: UpdateQuestionBankItemDto, updatedBy: string) {
    const item = await this.repository.findById(id);

    if (!item) {
      throw new NotFoundException('Question bank item not found');
    }

    const isMcq = item.type === 'mcq_single' || item.type === 'mcq_multi';

    if (dto.options !== undefined) {
      if (!isMcq) {
        throw new BadRequestException(
          `Cannot set options on a ${item.type} question`,
        );
      }
      this.validateMcqOptions(item.type, dto.options);
    }

    if (dto.testCases !== undefined) {
      if (item.type !== 'coding') {
        throw new BadRequestException(
          `Cannot set test cases on a ${item.type} question`,
        );
      }
      if (dto.testCases.length < 1) {
        throw new BadRequestException(
          'Coding questions must have at least one test case',
        );
      }
    }

    return this.repository.update(id, {
      tags: dto.tags ? this.normalizeTags(dto.tags) : undefined,
      difficulty: dto.difficulty,
      prompt: dto.prompt,
      points: dto.points,
      updatedBy,
      options: dto.options,
      testCases: dto.testCases?.map((testCase) => ({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        isHidden: testCase.isHidden ?? false,
        weight: testCase.weight ?? 1,
      })),
    });
  }

  async delete(id: string, deletedBy: string) {
    const item = await this.repository.findById(id);

    if (!item) {
      throw new NotFoundException('Question bank item not found');
    }

    return this.repository.softDelete(id, deletedBy);
  }
}

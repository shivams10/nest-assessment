import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QuestionsRepository } from './questions.repository';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ListQuestionsDto } from './dto/list-questions.dto';
import { QuestionType, QuestionCategory } from '@prisma/client';

@Injectable()
export class QuestionsService {
  constructor(private readonly repository: QuestionsRepository) {}

  async listQuestions(dto: ListQuestionsDto) {
    // Parse page and limit to ensure they are numbers
    const page = typeof dto.page === 'string' ? parseInt(dto.page, 10) : (dto.page || 1);
    const limit = typeof dto.limit === 'string' ? parseInt(dto.limit, 10) : (dto.limit || 10);
    
    // Validate parsed values
    const validPage = isNaN(page) || page < 1 ? 1 : page;
    const validLimit = isNaN(limit) || limit < 1 ? 10 : limit;
    
    const skip = (validPage - 1) * validLimit;

    const result = await this.repository.findMany({
      category: dto.category,
      type: dto.type,
      search: dto.search,
      skip,
      take: validLimit,
    });

    return {
      items: result.items,
      total: result.total,
    };
  }

  findById(id: string) {
    return this.repository.findById(id);
  }

  async create(dto: CreateQuestionDto, createdBy: string) {
    if (!dto.options || dto.options.length < 2) {
      throw new BadRequestException('Question must have at least 2 options');
    }

    const correctOptions = dto.options.filter((opt) => opt.isCorrect);

    if (dto.type === 'single_select' && correctOptions.length !== 1) {
      throw new BadRequestException(
        'Single select questions must have exactly one correct option',
      );
    }

    if (dto.type === 'multi_select' && correctOptions.length < 1) {
      throw new BadRequestException(
        'Multi select questions must have at least one correct option',
      );
    }

    return this.repository.create({
      stem: dto.stem,
      type: dto.type,
      category: dto.category,
      createdBy,
      options: dto.options,
    });
  }

  async update(id: string, dto: UpdateQuestionDto) {
    const question = await this.repository.findById(id);

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const updateData: {
      stem?: string;
      type?: QuestionType;
      category?: QuestionCategory;
      options?: { optionText: string; isCorrect: boolean }[];
    } = {};

    if (dto.stem !== undefined) {
      updateData.stem = dto.stem;
    }
    if (dto.type !== undefined) {
      updateData.type = dto.type;
    }
    if (dto.category !== undefined) {
      updateData.category = dto.category;
    }

    if (dto.options) {
      if (dto.options.length < 2) {
        throw new BadRequestException('Question must have at least 2 options');
      }

      const correctOptions = dto.options.filter((opt) => opt.isCorrect);
      const questionType = dto.type || question.type;

      if (questionType === 'single_select' && correctOptions.length !== 1) {
        throw new BadRequestException(
          'Single select questions must have exactly one correct option',
        );
      }

      if (questionType === 'multi_select' && correctOptions.length < 1) {
        throw new BadRequestException(
          'Multi select questions must have at least one correct option',
        );
      }

      // Map UpdateQuestionOptionDto to required format
      updateData.options = dto.options.map((opt) => ({
        optionText: opt.optionText || '',
        isCorrect: opt.isCorrect || false,
      }));
    }

    return this.repository.update(id, updateData);
  }

  async delete(id: string) {
    const question = await this.repository.findById(id);

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return this.repository.softDelete(id);
  }
}


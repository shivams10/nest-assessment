import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QuestionBankService } from './question-bank.service';
import { CreateQuestionBankItemDto } from './dto/create-question-bank-item.dto';
import { UpdateQuestionBankItemDto } from './dto/update-question-bank-item.dto';
import { ListQuestionBankDto } from './dto/list-question-bank.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('question-bank')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuestionBankController {
  constructor(private readonly service: QuestionBankService) {}

  // Declared ahead of `:id` so the literal segment wins the route match.
  @Get('tags')
  @Roles('interviewer', 'recruiter', 'admin')
  tags() {
    return this.service.tags();
  }

  @Get()
  @Roles('interviewer', 'recruiter', 'admin')
  list(@Query() dto: ListQuestionBankDto) {
    return this.service.list(dto);
  }

  @Get(':id')
  @Roles('interviewer', 'recruiter', 'admin')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('interviewer', 'admin')
  create(
    @Body() dto: CreateQuestionBankItemDto,
    @GetUser('sub') userId: string,
  ) {
    return this.service.create(dto, userId);
  }

  @Patch(':id')
  @Roles('interviewer', 'admin')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionBankItemDto,
    @GetUser('sub') userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  @Roles('interviewer', 'admin')
  delete(@Param('id') id: string, @GetUser('sub') userId: string) {
    return this.service.delete(id, userId);
  }
}

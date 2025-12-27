import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ExamSetQuestionsService } from './exam-set-questions.service';
import { AddExamSetQuestionsDto } from './dto/add-exam-set-questions.dto';

import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';

@Controller('exam-set-questions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamSetQuestionsController {
  constructor(private readonly service: ExamSetQuestionsService) {}

  @Post()
  @Roles('admin', 'moderator')
  addQuestions(@Body() dto: AddExamSetQuestionsDto) {
    return this.service.addQuestions(dto);
  }
}

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ExamSetQuestionsService } from './exam-set-questions.service';
import { AddExamSetQuestionsDto } from './dto/add-exam-set-questions.dto';

import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
export class ExamSetQuestionsController {
  constructor(private readonly service: ExamSetQuestionsService) {}

  @Get('admin/exam-sets/:sectionId/questions')
  getSectionQuestions(@Param('sectionId') sectionId: string) {
    return this.service.getSectionQuestions(sectionId);
  }

  @Post('exam-set-questions')
  addQuestions(@Body() dto: AddExamSetQuestionsDto) {
    return this.service.addQuestions(dto);
  }
}

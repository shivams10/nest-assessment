import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ExamSetsService } from './exam-sets.service';
import { CreateExamSetDto } from './dto/create-exam-set.dto';
import { CreateExamSetSectionDto } from './dto/create-exam-set-section.dto';
import { UpdateExamSetSectionDto } from './dto/update-exam-set-section.dto';

import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
export class ExamSetsController {
  constructor(private readonly service: ExamSetsService) {}

  @Get('admin/exams/:examId/sets')
  listExamSets(@Param('examId') examId: string) {
    return this.service.listExamSets(examId);
  }

  @Post('exam-sets')
  createSet(@Body() dto: CreateExamSetDto) {
    return this.service.createExamSet(dto);
  }

  @Delete('admin/exams/sets/:setId')
  deleteExamSet(@Param('setId') setId: string) {
    return this.service.deleteExamSet(setId);
  }

  @Post('exam-sets/sections')
  createSection(@Body() dto: CreateExamSetSectionDto) {
    return this.service.createExamSetSection(dto);
  }

  @Patch('admin/exam-sets/sections/:sectionId')
  updateSection(
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateExamSetSectionDto,
  ) {
    return this.service.updateExamSetSection(sectionId, dto);
  }
}

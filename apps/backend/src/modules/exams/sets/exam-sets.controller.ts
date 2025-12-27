import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ExamSetsService } from './exam-sets.service';
import { CreateExamSetDto } from './dto/create-exam-set.dto';
import { CreateExamSetSectionDto } from './dto/create-exam-set-section.dto';

import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';

@Controller('exam-sets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamSetsController {
  constructor(private readonly service: ExamSetsService) {}

  @Post()
  @Roles('admin', 'moderator')
  createSet(@Body() dto: CreateExamSetDto) {
    return this.service.createExamSet(dto);
  }

  @Post('sections')
  @Roles('admin', 'moderator')
  createSection(@Body() dto: CreateExamSetSectionDto) {
    return this.service.createExamSetSection(dto);
  }
}

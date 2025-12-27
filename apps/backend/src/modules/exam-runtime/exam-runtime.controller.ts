import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ExamRuntimeService } from './exam-runtime.service';
import { GetExamDto } from './dto/get-exam.dto';

import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { GetUser } from '@modules/auth/decorators/get-user.decorator';

@Controller('exam-runtime')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('candidate')
export class ExamRuntimeController {
  constructor(private readonly service: ExamRuntimeService) {}

  @Get()
  getExam(@Query() dto: GetExamDto, @GetUser('sub') userId: string) {
    return this.service.getExam(dto, userId);
  }
}

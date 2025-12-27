import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ExamRuntimeService } from './exam-runtime.service';
import { GetExamDto } from './dto/get-exam.dto';

import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { GetUser } from '@modules/auth/decorators/get-user.decorator';

@Controller('exam-runtime')
@UseGuards(JwtAuthGuard)
export class ExamRuntimeController {
  constructor(private readonly service: ExamRuntimeService) {}

  @Get()
  getExam(@Query() dto: GetExamDto, @GetUser('sub') userId: string) {
    return this.service.getExam(dto, userId);
  }
}

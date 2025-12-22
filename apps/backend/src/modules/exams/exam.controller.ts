import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CreateExamDto } from './dto/create-exam.dto';
import { ExamService } from './exam.service';

import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { GetUser } from '@modules/auth/decorators/get-user.decorator';
import { ListExamsDto } from './dto/list-exams.dto';

@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamsController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  @Roles('admin', 'moderator')
  createExam(@Body() dto: CreateExamDto, @GetUser('sub') userId: string) {
    return this.examService.createExam(dto, userId);
  }

  @Get('admin')
  @Roles('admin', 'moderator')
  listExamsForAdmin(@Query() query: ListExamsDto) {
    return this.examService.listExamsForAdmin(query);
  }

  @Patch(':id/publish')
  @Roles('admin', 'moderator')
  publishExam(@Param('id') id: string) {
    return this.examService.publishExam(id);
  }

  @Patch(':id/unpublish')
  @Roles('admin', 'moderator')
  unpublishExam(@Param('id') id: string) {
    return this.examService.unpublishExam(id);
  }
}

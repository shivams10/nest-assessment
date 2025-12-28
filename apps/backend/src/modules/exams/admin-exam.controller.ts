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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { ListExamsDto } from './dto/list-exams.dto';

@Controller('admin/exams')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
export class AdminExamController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  create(@Body() dto: CreateExamDto, @GetUser('sub') userId: string) {
    return this.examService.createExam(dto, userId);
  }

  @Get()
  list(@Query() dto: ListExamsDto) {
    return this.examService.listExamsForAdmin(dto);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.examService.findByIdForAdmin(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExamDto) {
    return this.examService.updateExam(id, dto);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string) {
    return this.examService.publishExam(id);
  }

  @Post(':id/unpublish')
  unpublish(@Param('id') id: string) {
    return this.examService.unpublishExam(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.examService.deleteExam(id);
  }
}

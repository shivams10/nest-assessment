import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuestionsBulkUploadService } from './questions-bulk-upload.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';

@Controller('admin/questions/bulk-upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
export class QuestionsBulkUploadController {
  constructor(private readonly service: QuestionsBulkUploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() uploadedFile: unknown,
    @GetUser('sub') userId: string,
  ) {
    if (
      !uploadedFile ||
      typeof uploadedFile !== 'object' ||
      !('buffer' in uploadedFile)
    ) {
      throw new BadRequestException('CSV file is required');
    }

    const { buffer } = uploadedFile as { buffer: Buffer };

    if (!(buffer instanceof Buffer)) {
      throw new BadRequestException('Invalid CSV file buffer');
    }

    return this.service.uploadQuestions(buffer, userId);
  }

  @Get(':id/status')
  getStatus(@Param('id') id: string) {
    return this.service.getUploadStatus(id);
  }
}


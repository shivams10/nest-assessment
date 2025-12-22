import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BulkUploadService } from './bulk-upload.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';

@Controller('candidates/bulk')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
export class BulkUploadController {
  constructor(private readonly service: BulkUploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() uploadedFile: unknown,
    @Body('collegeSessionId') collegeSessionId: string,
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

    return this.service.uploadCandidates(buffer, collegeSessionId, userId);
  }
}

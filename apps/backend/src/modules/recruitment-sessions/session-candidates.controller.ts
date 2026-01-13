import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { SessionCandidatesService } from './session-candidates.service';

@Controller('admin/sessions/:sessionId/candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
export class SessionCandidatesController {
  constructor(private readonly service: SessionCandidatesService) {}

  /**
   * Bulk assign candidates to session via CSV upload
   * POST /admin/sessions/:sessionId/candidates/bulk
   */
  @Post('bulk')
  @UseInterceptors(FileInterceptor('file'))
  bulkAssign(
    @Param('sessionId') sessionId: string,
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

    return this.service.bulkAssignFromCsv(buffer, sessionId, userId);
  }

  /**
   * Get paginated list of candidates for a session
   * GET /admin/sessions/:sessionId/candidates
   */
  @Get()
  list(
    @Param('sessionId') sessionId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.service.getSessionCandidates(
      sessionId,
      isNaN(pageNum) || pageNum < 1 ? 1 : pageNum,
      isNaN(limitNum) || limitNum < 1 ? 10 : limitNum,
    );
  }

  /**
   * Manually assign a candidate to a session
   * PATCH /admin/sessions/:sessionId/candidates/:candidateId
   */
  @Patch(':candidateId')
  assignCandidate(
    @Param('sessionId') sessionId: string,
    @Param('candidateId') candidateId: string,
  ) {
    return this.service.assignCandidateToSession(sessionId, candidateId);
  }
}

/**
 * Controller for unassigned candidates
 * GET /admin/candidates/unassigned
 */
@Controller('admin/candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
export class UnassignedCandidatesController {
  constructor(private readonly service: SessionCandidatesService) {}

  @Get('unassigned')
  list(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.service.getUnassignedCandidates(
      isNaN(pageNum) || pageNum < 1 ? 1 : pageNum,
      isNaN(limitNum) || limitNum < 1 ? 10 : limitNum,
    );
  }
}


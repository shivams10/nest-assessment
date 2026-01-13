import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminCandidatesService } from '../services/admin-candidates.service';
import { ListCandidatesDto } from '../dto/list-candidates.dto';
import { AssignCandidateSessionDto, BulkAssignCandidatesDto } from '../dto/assign-candidate-session.dto';

@Controller('admin/candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
export class AdminCandidatesController {
  constructor(private readonly service: AdminCandidatesService) {}

  @Get()
  listCandidates(@Query() dto: ListCandidatesDto) {
    return this.service.listCandidates(dto);
  }

  @Patch(':id/activate')
  activateCandidate(@Param('id') userId: string) {
    return this.service.activateCandidate(userId);
  }

  @Patch(':id/deactivate')
  deactivateCandidate(@Param('id') userId: string) {
    return this.service.deactivateCandidate(userId);
  }

  @Patch(':id/session')
  assignCandidateSession(
    @Param('id') userId: string,
    @Body() dto: AssignCandidateSessionDto,
  ) {
    return this.service.assignCandidateSession(userId, dto);
  }

  @Post('bulk-assign')
  bulkAssignCandidates(@Body() dto: BulkAssignCandidatesDto) {
    return this.service.bulkAssignCandidates(dto);
  }

  @Get('export')
  async exportCandidates(
    @Query() dto: Omit<ListCandidatesDto, 'page' | 'limit'>,
    @Res() res: Response,
  ) {
    const csv = await this.service.exportCandidates(dto);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="candidates-${new Date().toISOString().split('T')[0]}.csv"`,
    );

    return res.status(HttpStatus.OK).send(csv);
  }
}


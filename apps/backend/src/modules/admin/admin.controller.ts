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
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateModeratorDto } from './dto/create-moderator.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { ToggleNextRoundDto } from './dto/toggle-next-round.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ListUsersDto } from './dto/list-users.dto';
import { ListResultsDto } from './dto/list-results.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('admins')
  createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }

  @Post('moderators')
  createModerator(@Body() dto: CreateModeratorDto) {
    return this.adminService.createModerator(dto);
  }

  @Patch('users/:id/active')
  setUserActive(@Param('id') userId: string, @Body() dto: UpdateUserStatusDto) {
    return this.adminService.setUserActive(userId, dto.isActive);
  }

  @Patch('users/:id/delete')
  softDeleteUser(@Param('id') userId: string) {
    return this.adminService.softDeleteUser(userId);
  }

  @Patch('users/:id/password')
  setUserPassword(
    @Param('id') userId: string,
    @Body() dto: SetPasswordDto,
  ) {
    return this.adminService.setUserPassword(userId, dto.password);
  }

  @Get('users')
  listUsers(@Query() dto: ListUsersDto) {
    return this.adminService.listUsers(dto);
  }

  @Get('submissions/:submissionId/result')
  getSubmissionResult(@Param('submissionId') submissionId: string) {
    return this.adminService.getSubmissionResult(submissionId);
  }

  @Get('results')
  listResults(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('examId') examId?: string,
    @Query('collegeSessionId') collegeSessionId?: string,
    @Query('selectedForNextRound') selectedForNextRoundRaw?: string,
  ) {
    // Manually parse selectedForNextRound from raw query string to avoid implicit conversion
    let selectedForNextRound: boolean | undefined = undefined;
    if (
      selectedForNextRoundRaw !== undefined &&
      selectedForNextRoundRaw !== null
    ) {
      const lowercased = String(selectedForNextRoundRaw).toLowerCase().trim();
      if (lowercased === 'true' || lowercased === '1') {
        selectedForNextRound = true;
      } else if (lowercased === 'false' || lowercased === '0') {
        selectedForNextRound = false;
      }
    }

    const dto: ListResultsDto = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      examId,
      collegeSessionId,
      selectedForNextRound,
    };

    console.log(
      `[DEBUG] Controller - raw: "${selectedForNextRoundRaw}", parsed: ${selectedForNextRound}`,
    );

    return this.adminService.listResults(dto);
  }

  @Patch('results/:submissionId/next-round')
  toggleNextRoundSelection(
    @Param('submissionId') submissionId: string,
    @Body() dto: ToggleNextRoundDto,
  ) {
    return this.adminService.toggleNextRoundSelection(
      submissionId,
      dto.selectedForNextRound,
    );
  }
}

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

import { UsersService, assertInviterRole } from './users.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { ListTeamDto } from './dto/list-team.dto';
import { UpdateActiveStatusDto } from './dto/update-active-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

// admin manages recruiters, recruiter manages interviewers they invited —
// interviewer has no access to any endpoint on this controller.
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'recruiter')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('invite')
  inviteUser(
    @GetUser('sub') callerId: string,
    @GetUser('role') callerRole: JwtPayload['role'],
    @Body() dto: InviteUserDto,
  ) {
    assertInviterRole(callerRole);
    return this.usersService.inviteUser(callerId, callerRole, dto);
  }

  @Get('team')
  listTeam(
    @GetUser('sub') callerId: string,
    @GetUser('role') callerRole: JwtPayload['role'],
    @Query() dto: ListTeamDto,
  ) {
    assertInviterRole(callerRole);
    return this.usersService.listTeam(callerId, callerRole, dto);
  }

  @Patch(':id/activate')
  setActive(
    @GetUser('sub') callerId: string,
    @GetUser('role') callerRole: JwtPayload['role'],
    @Param('id') userId: string,
    @Body() dto: UpdateActiveStatusDto,
  ) {
    assertInviterRole(callerRole);
    return this.usersService.setTeamMemberActive(
      callerId,
      callerRole,
      userId,
      dto.isActive,
    );
  }

  @Delete(':id')
  softDelete(
    @GetUser('sub') callerId: string,
    @GetUser('role') callerRole: JwtPayload['role'],
    @Param('id') userId: string,
  ) {
    assertInviterRole(callerRole);
    return this.usersService.softDeleteTeamMember(callerId, callerRole, userId);
  }
}

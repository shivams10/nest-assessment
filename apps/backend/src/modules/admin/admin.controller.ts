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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ListUsersDto } from './dto/list-users.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
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

  @Get('users')
  listUsers(@Query() dto: ListUsersDto) {
    return this.adminService.listUsers(dto);
  }
}

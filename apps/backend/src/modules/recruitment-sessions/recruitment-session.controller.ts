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
import { RecruitmentSessionService } from './recruitment-session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { ListSessionsDto } from './dto/list-sessions.dto';

@Controller('admin/sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
export class RecruitmentSessionController {
  constructor(private readonly sessionService: RecruitmentSessionService) {}

  @Post()
  create(@Body() dto: CreateSessionDto, @GetUser('sub') userId: string) {
    return this.sessionService.create(dto, userId);
  }

  @Get()
  list(@Query() dto: ListSessionsDto) {
    return this.sessionService.list(dto);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.sessionService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.sessionService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.sessionService.delete(id);
  }
}

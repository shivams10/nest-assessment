import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { UserRole } from '@prisma/client';

import { InviteUserDto } from './dto/invite-user.dto';
import { ListTeamDto } from './dto/list-team.dto';
import { TEAM_MEMBER_SELECT } from './constants/team-member.select';

type InviterRole = Extract<UserRole, 'admin' | 'recruiter'>;

// Who a caller is allowed to invite / manage, one level down the hierarchy.
const INVITE_TARGET_ROLE: Record<InviterRole, UserRole> = {
  admin: UserRole.recruiter,
  recruiter: UserRole.interviewer,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async inviteUser(
    callerId: string,
    callerRole: InviterRole,
    dto: InviteUserDto,
  ) {
    const targetRole = INVITE_TARGET_ROLE[callerRole];

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('User already exists');
    }

    return this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: targetRole,
        isActive: true,
        invitedBy: callerId,
        invitedAt: new Date(),
        passwordHash: null,
      },
      select: TEAM_MEMBER_SELECT,
    });
  }

  async listTeam(callerId: string, callerRole: InviterRole, dto: ListTeamDto) {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 50);
    const skip = (page - 1) * limit;

    const where = this.scopeForRole(callerId, callerRole);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: TEAM_MEMBER_SELECT,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async setTeamMemberActive(
    callerId: string,
    callerRole: InviterRole,
    userId: string,
    isActive: boolean,
  ) {
    const member = await this.findManagedMember(callerId, callerRole, userId);

    return this.prisma.user.update({
      where: { id: member.id },
      data: { isActive },
      select: TEAM_MEMBER_SELECT,
    });
  }

  async softDeleteTeamMember(
    callerId: string,
    callerRole: InviterRole,
    userId: string,
  ) {
    const member = await this.findManagedMember(callerId, callerRole, userId);

    return this.prisma.user.update({
      where: { id: member.id },
      data: { deletedAt: new Date(), isActive: false },
      select: TEAM_MEMBER_SELECT,
    });
  }

  /**
   * admin manages every recruiter; a recruiter only manages the interviewers
   * they personally invited (not other recruiters' interviewers).
   */
  private scopeForRole(callerId: string, callerRole: InviterRole) {
    const targetRole = INVITE_TARGET_ROLE[callerRole];

    if (callerRole === 'admin') {
      return { role: targetRole, deletedAt: null };
    }

    return { role: targetRole, invitedBy: callerId, deletedAt: null };
  }

  private async findManagedMember(
    callerId: string,
    callerRole: InviterRole,
    userId: string,
  ) {
    const member = await this.prisma.user.findFirst({
      where: { id: userId, ...this.scopeForRole(callerId, callerRole) },
    });

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    return member;
  }
}

// Guard against a caller role slipping through that isn't a recognized
// inviter — the controller's @Roles('admin','recruiter') should make this
// unreachable, but fail loudly rather than silently if it ever isn't.
export function assertInviterRole(role: string): asserts role is InviterRole {
  if (role !== 'admin' && role !== 'recruiter') {
    throw new ForbiddenException('Insufficient permissions');
  }
}

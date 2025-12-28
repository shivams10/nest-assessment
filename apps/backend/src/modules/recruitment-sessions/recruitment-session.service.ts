import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { RecruitmentSessionRepository } from './recruitment-session.repository';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { ListSessionsDto } from './dto/list-sessions.dto';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class RecruitmentSessionService {
  private readonly logger = new Logger(RecruitmentSessionService.name);

  constructor(
    private readonly repository: RecruitmentSessionRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateSessionDto, createdBy: string) {
    // Validate dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Determine status based on dates
    const now = new Date();
    let status: SessionStatus = SessionStatus.upcoming;

    if (now >= startDate && now <= endDate) {
      status = SessionStatus.active;
    } else if (now > endDate) {
      status = SessionStatus.completed;
    }

    // Validate college exists if provided
    if (dto.collegeId) {
      const college = await this.prisma.college.findUnique({
        where: { id: dto.collegeId },
      });

      if (!college) {
        throw new NotFoundException('College not found');
      }
    }

    const session = await this.repository.create({
      name: dto.name,
      year: dto.year,
      startDate,
      endDate,
      status,
      collegeId: dto.collegeId || null,
      createdBy,
    });

    this.logger.log(
      `Recruitment session created: id=${session.id}, name=${session.name}`,
    );

    return session;
  }

  async list(dto: ListSessionsDto) {
    const pageNum = dto.page
      ? typeof dto.page === 'string'
        ? parseInt(dto.page, 10)
        : Number(dto.page)
      : 1;
    const limitNum = dto.limit
      ? typeof dto.limit === 'string'
        ? parseInt(dto.limit, 10)
        : Number(dto.limit)
      : 20;

    const page = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
    const limit = isNaN(limitNum) || limitNum < 1 ? 20 : limitNum;
    const skip = (page - 1) * limit;

    return this.repository.findMany({
      status: dto.status,
      collegeId: dto.collegeId,
      skip,
      take: limit,
    });
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async update(id: string, dto: UpdateSessionDto) {
    // Validate dates if both provided
    if (dto.startDate && dto.endDate) {
      const startDate = new Date(dto.startDate);
      const endDate = new Date(dto.endDate);

      if (endDate < startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // Validate college exists if provided
    if (dto.collegeId) {
      const college = await this.prisma.college.findUnique({
        where: { id: dto.collegeId },
      });

      if (!college) {
        throw new NotFoundException('College not found');
      }
    }

    // Auto-update status if dates are provided
    let status = dto.status;
    if (dto.startDate || dto.endDate || !status) {
      const existing = await this.repository.findById(id);
      const startDate = dto.startDate
        ? new Date(dto.startDate)
        : existing.startDate
          ? new Date(existing.startDate)
          : null;
      const endDate = dto.endDate
        ? new Date(dto.endDate)
        : existing.endDate
          ? new Date(existing.endDate)
          : null;

      if (startDate && endDate) {
        const now = new Date();
        if (now >= startDate && now <= endDate) {
          status = SessionStatus.active;
        } else if (now > endDate) {
          status = SessionStatus.completed;
        } else {
          status = SessionStatus.upcoming;
        }
      }
    }

    const updateData: {
      name?: string;
      year?: number;
      startDate?: Date | null;
      endDate?: Date | null;
      status?: SessionStatus;
      collegeId?: string | null;
    } = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.year !== undefined) updateData.year = dto.year;
    if (dto.startDate !== undefined)
      updateData.startDate = dto.startDate ? new Date(dto.startDate) : null;
    if (dto.endDate !== undefined)
      updateData.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (status !== undefined) updateData.status = status;
    if (dto.collegeId !== undefined)
      updateData.collegeId = dto.collegeId || null;

    const session = await this.repository.update(id, updateData);

    this.logger.log(`Recruitment session updated: id=${session.id}`);

    return session;
  }

  async delete(id: string) {
    const session = await this.repository.softDelete(id);

    this.logger.log(`Recruitment session deleted: id=${session.id}`);

    return session;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Prisma, SessionStatus } from '@prisma/client';

const SESSION_PUBLIC_SELECT = {
  id: true,
  name: true,
  year: true,
  startDate: true,
  endDate: true,
  status: true,
  collegeId: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class RecruitmentSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const session = await this.prisma.recruitmentSession.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: SESSION_PUBLIC_SELECT,
    });

    if (!session) {
      throw new NotFoundException('Recruitment session not found');
    }

    return session;
  }

  async findMany(filters: {
    status?: SessionStatus;
    collegeId?: string;
    skip: number;
    take: number;
  }) {
    const { status, collegeId, skip, take } = filters;

    const where: Prisma.RecruitmentSessionWhereInput = {
      deletedAt: null,
      ...(status && { status }),
      ...(collegeId && { collegeId }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.recruitmentSession.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: SESSION_PUBLIC_SELECT,
      }),
      this.prisma.recruitmentSession.count({ where }),
    ]);

    return { items, total };
  }

  async create(data: {
    name: string;
    year: number;
    startDate: Date | null;
    endDate: Date | null;
    status: SessionStatus;
    collegeId: string | null;
    createdBy: string;
  }) {
    const createData: Prisma.RecruitmentSessionUncheckedCreateInput = {
      name: data.name,
      year: data.year,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      collegeId: data.collegeId,
      createdBy: data.createdBy,
    };

    return this.prisma.recruitmentSession.create({
      data: createData,
      select: SESSION_PUBLIC_SELECT,
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      year?: number;
      startDate?: Date | null;
      endDate?: Date | null;
      status?: SessionStatus;
      collegeId?: string | null;
    },
  ) {
    const session = await this.prisma.recruitmentSession.findFirst({
      where: { id, deletedAt: null },
    });

    if (!session) {
      throw new NotFoundException('Recruitment session not found');
    }

    const updateData: Prisma.RecruitmentSessionUncheckedUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.endDate !== undefined) updateData.endDate = data.endDate;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.collegeId !== undefined) updateData.collegeId = data.collegeId;

    return this.prisma.recruitmentSession.update({
      where: { id },
      data: updateData,
      select: SESSION_PUBLIC_SELECT,
    });
  }

  async softDelete(id: string) {
    const session = await this.prisma.recruitmentSession.findFirst({
      where: { id, deletedAt: null },
    });

    if (!session) {
      throw new NotFoundException('Recruitment session not found');
    }

    return this.prisma.recruitmentSession.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: SESSION_PUBLIC_SELECT,
    });
  }
}

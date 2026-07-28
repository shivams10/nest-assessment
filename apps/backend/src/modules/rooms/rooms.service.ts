import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ROOM_SELECT } from './constants/room.select';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async createRoom(dto: CreateRoomDto) {
    const existing = await this.prisma.meetingRoom.findUnique({
      where: { resourceEmail: dto.resourceEmail },
    });

    if (existing) {
      throw new ConflictException(
        'A room with this resource email already exists',
      );
    }

    return this.prisma.meetingRoom.create({
      data: {
        name: dto.name,
        resourceEmail: dto.resourceEmail,
        location: dto.location,
        capacity: dto.capacity,
      },
      select: ROOM_SELECT,
    });
  }

  /**
   * Admin sees every room (including deactivated, so they can reactivate);
   * recruiter only sees rooms they can actually pick when scheduling.
   */
  async listRooms(callerRole: string) {
    const where = callerRole === 'admin' ? {} : { isActive: true };

    return this.prisma.meetingRoom.findMany({
      where,
      orderBy: { name: 'asc' },
      select: ROOM_SELECT,
    });
  }

  async updateRoom(id: string, dto: UpdateRoomDto) {
    const room = await this.prisma.meetingRoom.findUnique({ where: { id } });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return this.prisma.meetingRoom.update({
      where: { id },
      data: dto,
      select: ROOM_SELECT,
    });
  }
}

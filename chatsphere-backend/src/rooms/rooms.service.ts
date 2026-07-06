import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsService {

  constructor(
    @InjectRepository(Room)
    private roomsRepo: Repository<Room>,
  ) {}

  async create(dto: CreateRoomDto): Promise<Room> {
    const existing = await this.roomsRepo.findOneBy({ name: dto.name });
    if (existing) {
      throw new ConflictException('A room with this name already exists');
    }

    const room = this.roomsRepo.create(dto);
    return this.roomsRepo.save(room);
  }

  findAll(): Promise<Room[]> {
    return this.roomsRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.roomsRepo.findOneBy({ id });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }
}
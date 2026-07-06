import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {

  constructor(
    @InjectRepository(Message)
    private messagesRepo: Repository<Message>,
  ) {}

  async create(roomId: string, userId: string, dto: CreateMessageDto): Promise<Message> {
    const message = this.messagesRepo.create({
      content: dto.content,
      roomId,
      userId,
    });
    return this.messagesRepo.save(message);
  }

  findByRoom(roomId: string): Promise<Message[]> {
    return this.messagesRepo.find({
      where: { roomId },
      relations: {user : true},     // joins the User table automatically
      order: { createdAt: 'ASC' },
    });
  }
}
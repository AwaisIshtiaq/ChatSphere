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

async findByRoom(
  roomId: string,
  page: number = 1,
  limit: number = 20,
): Promise<{ messages: Message[]; total: number; page: number }> {
  const [messages, total] = await this.messagesRepo.findAndCount({
    where: { roomId },
    relations: { user: true },
    order: { createdAt: 'DESC' },   // newest first
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    messages: messages.reverse(), // reverse so oldest is at top
    total,
    page,
  };
}
  
  findById(id: string): Promise<Message | null> {
  return this.messagesRepo.findOne({
    where: { id },
    relations: { user: true },
  });
}

}
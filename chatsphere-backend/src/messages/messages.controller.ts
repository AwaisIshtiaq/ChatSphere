import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('rooms/:roomId/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {

  constructor(private messagesService: MessagesService) {}

  @Post()
  create(
    @Param('roomId') roomId: string,
    @Body() dto: CreateMessageDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.messagesService.create(roomId, user.id, dto);
  }

  @Get()
  findAll(
    @Param('roomId') roomId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.messagesService.findByRoom(roomId, +page, +limit);
  }
}
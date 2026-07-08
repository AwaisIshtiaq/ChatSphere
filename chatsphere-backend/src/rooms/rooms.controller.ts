import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {

  constructor(private roomsService: RoomsService) {}

  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)  // ← caches this response for 30 seconds
  findAll() {
    return this.roomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }
}
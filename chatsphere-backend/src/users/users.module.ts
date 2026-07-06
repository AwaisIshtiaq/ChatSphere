// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // registers the User repository
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // so AuthModule can use UsersService
})
export class UsersModule {}
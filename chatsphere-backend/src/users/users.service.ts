import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  // Get all users
  findAll(): Promise<User[]> {
    return this.usersRepo.find({
      select: {
        id: true,
        username: true,
        email: true,
        isOnline: true,
        createdAt: true,
      },
    });
  }

  // Find a single user by ID
  findOne(id: string): Promise<User | null> {
    return this.usersRepo.findOneBy({ id });
  }

  // Find by email — used during login
  findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOneBy({ email });
  }

  // Register a new user
  async create(data: {
    username: string;
    email: string;
    password: string;
  }): Promise<User> {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.usersRepo.create({
      ...data,
      password: hashedPassword,
    });

    return this.usersRepo.save(user);
  }

  // Update online status — used by WebSocket gateway
  async setOnlineStatus(id: string, isOnline: boolean): Promise<void> {
    await this.usersRepo.update(id, { isOnline });
  }
}
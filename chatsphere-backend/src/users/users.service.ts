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

  // Get all users (we'll use this to show online members in ChatSphere)
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

  // Find a single user by their ID
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
    // Check if email is already taken
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    // Hash the password before saving — NEVER save plain text passwords
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.usersRepo.create({
      ...data,
      password: hashedPassword,
    });

    return this.usersRepo.save(user);
  }
}
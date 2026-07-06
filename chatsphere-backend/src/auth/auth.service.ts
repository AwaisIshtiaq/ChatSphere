import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Register → save user → return JWT token
  async register(username: string, email: string, password: string) {
    const user = await this.usersService.create({ username, email, password });

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    return {
      message: 'Registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    };
  }

  // Login → verify password → return JWT token
  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    return {
      message: 'Logged in successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    };
  }
}
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RoomsModule } from './rooms/rooms.module';
import { MessagesModule } from './messages/messages.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({ isGlobal: true }),

    // Cache — 30 seconds
    CacheModule.register({ isGlobal: true, ttl: 30000 }),

    // Rate limiting — max 20 requests per minute
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 20,
    }]),

    // Database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host:     config.get('DB_HOST'),
        port:     config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        ssl: { rejectUnauthorized: false },
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    UsersModule,
    AuthModule,
    RoomsModule,
    MessagesModule,
    ChatModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,  // applies rate limiting to ALL routes
    },
  ],
})
export class AppModule {}
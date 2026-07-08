import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from '../messages/messages.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: false,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>();

  constructor(
    private messagesService: MessagesService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ─── Connection ──────────────────────────────────────────────────────────────
  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      this.connectedUsers.set(client.id, payload.sub);
      await this.usersService.setOnlineStatus(payload.sub, true);

      this.server.emit('userOnline', {
        userId: payload.sub,
        username: payload.username,
      });

      console.log(`✅ Connected: ${payload.username}`);
    } catch (err) {
      client.disconnect();
    }
  }

  // ─── Disconnection ───────────────────────────────────────────────────────────
  async handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);

    if (userId) {
      await this.usersService.setOnlineStatus(userId, false);
      this.server.emit('userOffline', { userId });
      this.connectedUsers.delete(client.id);
      console.log(`❌ Disconnected: ${userId}`);
    }
  }

  // ─── Join Room ───────────────────────────────────────────────────────────────
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.roomId);
    client.emit('joinedRoom', { roomId: data.roomId });
    console.log(`👤 Socket ${client.id} joined room ${data.roomId}`);
  }

  // ─── Leave Room ──────────────────────────────────────────────────────────────
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.roomId);
    client.emit('leftRoom', { roomId: data.roomId });
  }

  // ─── Send Message ─────────────────────────────────────────────────────────────
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { roomId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);

    if (!userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    const message = await this.messagesService.create(
      data.roomId,
      userId,
      { content: data.content },
    );

    const fullMessage = await this.messagesService.findById(message.id);

    if (!fullMessage) return;

    this.server.to(data.roomId).emit('receiveMessage', {
      id: fullMessage.id,
      content: fullMessage.content,
      userId: fullMessage.userId,
      roomId: fullMessage.roomId,
      createdAt: fullMessage.createdAt,
      user: { username: fullMessage.user?.username || 'Unknown' },
    });
  }

  // ─── Typing Indicator ─────────────────────────────────────────────────────────
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { roomId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    client.to(data.roomId).emit('userTyping', {
      userId,
      isTyping: data.isTyping,
    });
  }
}
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
    origin: '*', // Next.js frontend URL
    credentials: false,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  // Track which socket belongs to which user
  private connectedUsers = new Map<string, string>(); // socketId → userId

  constructor(
    private messagesService: MessagesService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ─── Runs when a client connects ────────────────────────────────────────────
  async handleConnection(client: Socket) {
    try {
      // Extract JWT token from handshake
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      // Verify the token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Store the connection
      this.connectedUsers.set(client.id, payload.sub);

      // Update user as online in DB
      await this.usersService.setOnlineStatus(payload.sub, true);

      // Tell everyone this user is online
      this.server.emit('userOnline', {
        userId: payload.sub,
        username: payload.username,
      });

      console.log(`✅ Client connected: ${payload.username}`);
    } catch (err) {
      // Invalid token → disconnect immediately
      client.disconnect();
    }
  }

  // ─── Runs when a client disconnects ─────────────────────────────────────────
  async handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);

    if (userId) {
      await this.usersService.setOnlineStatus(userId, false);

      this.server.emit('userOffline', { userId });

      this.connectedUsers.delete(client.id);
      console.log(`❌ Client disconnected: ${userId}`);
    }
  }

  // ─── Join a chat room ────────────────────────────────────────────────────────
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.roomId); // Socket.io room = our ChatSphere room
    client.emit('joinedRoom', { roomId: data.roomId });
    console.log(`👤 Socket ${client.id} joined room ${data.roomId}`);
  }

  // ─── Leave a chat room ───────────────────────────────────────────────────────
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.roomId);
    client.emit('leftRoom', { roomId: data.roomId });
  }

  // ─── Send a message ──────────────────────────────────────────────────────────
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

    // Save message to database
    const message = await this.messagesService.create(
      data.roomId,
      userId,
      { content: data.content },
    );

    // Broadcast to everyone in the room (including sender)
    this.server.to(data.roomId).emit('receiveMessage', {
      id: message.id,
      content: message.content,
      userId: message.userId,
      roomId: message.roomId,
      createdAt: message.createdAt,
    });
  }
}
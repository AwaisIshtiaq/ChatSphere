import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from '@/store/useStore';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { token, addMessage } = useStore();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!token) return;

    // Connect to NestJS WebSocket gateway
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ Connected to ChatSphere');
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
    });

    // Receive new message
    socket.on('receiveMessage', (message) => {
      addMessage(message);
    });

    // Typing indicator
    socket.on('userTyping', (data: { userId: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUsers(prev => new Set(prev).add(data.userId));
      } else {
        setTypingUsers(prev => {
          const next = new Set(prev);
          next.delete(data.userId);
          return next;
        });
      }
    });

    socket.on('userOnline', (data) => {
      console.log('🟢 User online:', data);
    });

    socket.on('userOffline', (data) => {
      console.log('🔴 User offline:', data);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const joinRoom = (roomId: string) => {
    socketRef.current?.emit('joinRoom', { roomId });
  };

  const sendMessage = (roomId: string, content: string) => {
    socketRef.current?.emit('sendMessage', { roomId, content });
  };

  const sendTyping = (roomId: string, isTyping: boolean) => {
    socketRef.current?.emit('typing', { roomId, isTyping });
  };

  return { joinRoom, sendMessage, sendTyping, typingUsers };
};
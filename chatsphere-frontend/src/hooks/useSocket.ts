import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from '@/store/useStore';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { token, addMessage } = useStore();

  useEffect(() => {
    if (!token) return;

    // Connect to NestJS WebSocket gateway
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token },
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ Connected to ChatSphere');
    });

    socket.on('receiveMessage', (message) => {
      addMessage(message);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
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

  return { joinRoom, sendMessage };
};
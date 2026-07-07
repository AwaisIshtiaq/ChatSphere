'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useStore } from '@/store/useStore';
import { useSocket } from '@/hooks/useSocket';

export default function ChatPage() {
  const router = useRouter();
  const { user, token, logout, rooms, setRooms, currentRoom, setCurrentRoom, messages, setMessages } = useStore();
  const { joinRoom, sendMessage } = useSocket();
  const [newMessage, setNewMessage] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchRooms();
  }, [token]);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch {
      logout();
      router.push('/login');
    }
  };

  const handleJoinRoom = async (room: any) => {
    setCurrentRoom(room);
    joinRoom(room.id);
    // Load message history
    const res = await api.get(`/rooms/${room.id}/messages`);
    setMessages(res.data);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentRoom) return;
    sendMessage(currentRoom.id, newMessage);
    setNewMessage('');
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    try {
      await api.post('/rooms', { name: newRoomName });
      setNewRoomName('');
      setShowCreateRoom(false);
      fetchRooms();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create room');
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">

      {/* Sidebar */}
      <div className="w-64 bg-gray-800 flex flex-col">
        {/* App header */}
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">💬 ChatSphere</h1>
          <p className="text-gray-400 text-sm mt-1">Hey, {user?.username}!</p>
        </div>

        {/* Rooms list */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs uppercase font-semibold">Rooms</span>
            <button
              onClick={() => setShowCreateRoom(!showCreateRoom)}
              className="text-gray-400 hover:text-white text-lg leading-none"
            >
              +
            </button>
          </div>

          {showCreateRoom && (
            <div className="mb-3">
              <input
                className="w-full bg-gray-700 text-white p-2 rounded text-sm outline-none mb-1"
                placeholder="Room name..."
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
              />
              <button
                onClick={handleCreateRoom}
                className="w-full bg-blue-600 text-white text-sm p-1.5 rounded hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          )}

          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => handleJoinRoom(room)}
              className={`w-full text-left p-2.5 rounded-lg mb-1 text-sm transition ${
                currentRoom?.id === room.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              # {room.name}
            </button>
          ))}
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-gray-700">
          <button
            onClick={() => { logout(); router.push('/login'); }}
            className="w-full text-gray-400 hover:text-white text-sm p-2 rounded hover:bg-gray-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            {/* Room header */}
            <div className="p-4 border-b border-gray-700 bg-gray-800">
              <h2 className="font-semibold"># {currentRoom.name}</h2>
              {currentRoom.description && (
                <p className="text-gray-400 text-sm">{currentRoom.description}</p>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    msg.userId === user?.id
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-700 text-gray-100 rounded-bl-sm'
                  }`}>
                    {msg.userId !== user?.id && (
                      <p className="text-xs text-gray-400 mb-1">
                        {msg.user?.username || 'Unknown'}
                      </p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-60 mt-1 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-gray-700 bg-gray-800">
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-gray-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder={`Message #${currentRoom.name}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-lg font-medium">Welcome to ChatSphere</p>
              <p className="text-sm mt-1">Select a room to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
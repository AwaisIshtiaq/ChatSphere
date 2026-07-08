'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useStore } from '@/store/useStore';
import { useSocket } from '@/hooks/useSocket';

export default function ChatPage() {
  const router = useRouter();
  const {
    user, token, logout,
    rooms, setRooms,
    currentRoom, setCurrentRoom,
    messages, setMessages,
  } = useStore();

  const { joinRoom, sendMessage, sendTyping, typingUsers } = useSocket();
  const [newMessage, setNewMessage] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    const savedUser = localStorage.getItem('user');
    if (savedUser && !user) useStore.setState({ user: JSON.parse(savedUser) });
    fetchRooms();
  }, [token]);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch {
      logout(); router.push('/login');
    }
  };

  const handleJoinRoom = async (room: any) => {
    setCurrentRoom(room);
    joinRoom(room.id);
    try {
      const res = await api.get(`/rooms/${room.id}/messages?page=1&limit=20`);
      setMessages(res.data.messages || res.data);
    } catch (err) { console.error('Failed to load messages', err); }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentRoom) return;
    sendMessage(currentRoom.id, newMessage);
    setNewMessage('');
    if (currentRoom) sendTyping(currentRoom.id, false);
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    if (!currentRoom) return;
    sendTyping(currentRoom.id, true);
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => sendTyping(currentRoom.id, false), 2000);
    setTypingTimeout(timeout);
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    try {
      await api.post('/rooms', { name: newRoomName, description: newRoomDesc });
      setNewRoomName(''); setNewRoomDesc('');
      setShowCreateRoom(false);
      fetchRooms();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create room');
    }
  };

  const neo = {
    border: '4px solid #1b1b1b',
    shadow: '4px 4px 0px 0px rgba(0,0,0,1)',
    shadowLg: '8px 8px 0px 0px rgba(0,0,0,1)',
    font: "'JetBrains Mono', 'Space Mono', monospace",
  };

  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100%',
      overflow: 'hidden', fontFamily: neo.font,
      background: '#f9f9f9', color: '#1b1b1b',
    }}>

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside style={{
        width: 280, background: '#eeeeee',
        borderRight: neo.border, display: 'flex',
        flexDirection: 'column', padding: 16, gap: 16,
        flexShrink: 0, zIndex: 20,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, background: '#00ff66',
            border: neo.border, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: neo.shadow, fontSize: '1.2rem',
          }}>💬</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.5 }}>ChatSphere</div>
            <div style={{ fontSize: 12, color: '#3b4b3a' }}>Hey, {user?.username}!</div>
          </div>
        </div>

        {/* New Room Button */}
        <button
          onClick={() => setShowCreateRoom(!showCreateRoom)}
          style={{
            background: '#626200', color: '#fff',
            border: neo.border, padding: '12px 16px',
            fontFamily: neo.font, fontWeight: 700,
            fontSize: 13, textTransform: 'uppercase',
            letterSpacing: 2, cursor: 'pointer',
            boxShadow: neo.shadow, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            gap: 8, transition: 'all 0.1s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translate(4px, 4px)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'none';
            (e.currentTarget as HTMLElement).style.boxShadow = neo.shadow;
          }}
        >
          + New Room
        </button>

        {/* Create Room Form */}
        {showCreateRoom && (
          <div style={{
            border: neo.border, padding: 12,
            background: '#f9f9f9', boxShadow: neo.shadow,
          }}>
            <input
              style={{
                width: '100%', padding: '10px 12px',
                fontFamily: neo.font, fontSize: 13,
                border: neo.border, background: '#fff',
                marginBottom: 8, boxSizing: 'border-box',
                outline: 'none',
              }}
              placeholder="ROOM NAME..."
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
            />
            <input
              style={{
                width: '100%', padding: '10px 12px',
                fontFamily: neo.font, fontSize: 13,
                border: neo.border, background: '#fff',
                marginBottom: 8, boxSizing: 'border-box',
                outline: 'none',
              }}
              placeholder="DESCRIPTION..."
              value={newRoomDesc}
              onChange={(e) => setNewRoomDesc(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleCreateRoom}
                style={{
                  flex: 1, padding: '8px', fontFamily: neo.font,
                  fontWeight: 700, fontSize: 12, textTransform: 'uppercase',
                  border: neo.border, background: '#006e27', color: '#fff',
                  cursor: 'pointer', boxShadow: neo.shadow,
                }}
              >Create</button>
              <button
                onClick={() => setShowCreateRoom(false)}
                style={{
                  flex: 1, padding: '8px', fontFamily: neo.font,
                  fontWeight: 700, fontSize: 12, textTransform: 'uppercase',
                  border: neo.border, background: '#fff', color: '#1b1b1b',
                  cursor: 'pointer',
                }}
              >Cancel</button>
            </div>
          </div>
        )}

        {/* Rooms Label */}
        <div style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: 4, color: '#3b4b3a', padding: '0 4px',
        }}>Rooms</div>

        {/* Room List */}
        <nav style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rooms.length === 0 && (
            <div style={{ fontSize: 12, color: '#999', textAlign: 'center', padding: '20px 0' }}>
              NO ROOMS YET
            </div>
          )}
          {rooms.map((room) => {
            const isActive = currentRoom?.id === room.id;
            return (
              <button
                key={room.id}
                onClick={() => handleJoinRoom(room)}
                style={{
                  background: isActive ? '#e7e700' : 'transparent',
                  border: isActive ? neo.border : '2px solid transparent',
                  boxShadow: isActive ? neo.shadow : 'none',
                  padding: '12px', fontFamily: neo.font,
                  fontWeight: 700, fontSize: 13,
                  color: isActive ? '#666600' : '#3b4b3a',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: 8,
                  textAlign: 'left', transition: 'all 0.1s',
                  textTransform: 'lowercase',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = '#cdcd00';
                    (e.currentTarget as HTMLElement).style.transform = 'translate(2px, 2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.transform = 'none';
                  }
                }}
              >
                <span style={{ fontSize: 16 }}>💬</span>
                <span># {room.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: neo.border, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 36, height: 36, background: '#00ff66',
              border: neo.border, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 14, boxShadow: neo.shadow,
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{user?.username}</span>
          </div>
          <button
            onClick={() => { logout(); router.push('/login'); }}
            style={{
              background: 'transparent', border: neo.border,
              padding: '10px', fontFamily: neo.font, fontWeight: 700,
              fontSize: 12, textTransform: 'uppercase', letterSpacing: 2,
              cursor: 'pointer', color: '#1b1b1b', transition: 'all 0.1s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#ff2d2d';
              (e.currentTarget as HTMLElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = '#1b1b1b';
            }}
          >
            ⎋ Logout
          </button>
        </div>
      </aside>

      {/* ── Main Chat ──────────────────────────────────────── */}
      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        minWidth: 0, background: '#f9f9f9',
      }}>
        {currentRoom ? (
          <>
            {/* Header */}
            <header style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '16px 32px',
              background: '#f9f9f9', borderBottom: neo.border,
              position: 'sticky', top: 0, zIndex: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ color: '#006e27', fontSize: 28, fontWeight: 900 }}>#</span>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5 }}>
                    {currentRoom.name.toUpperCase()}
                  </div>
                  {currentRoom.description && (
                    <div style={{ fontSize: 12, color: '#3b4b3a' }}>
                      {currentRoom.description}
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '32px',
              display: 'flex', flexDirection: 'column', gap: 24,
            }}>
              {/* Date divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1, height: 2, background: '#1b1b1b' }}/>
                <span style={{
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: 2, background: '#e7e700',
                  padding: '4px 12px', border: neo.border, boxShadow: neo.shadow,
                }}>TODAY</span>
                <div style={{ flex: 1, height: 2, background: '#1b1b1b' }}/>
              </div>

              {messages.length === 0 && (
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 12, opacity: 0.3, marginTop: 60,
                }}>
                  <div style={{ fontSize: 48 }}>💬</div>
                  <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 3, fontWeight: 700 }}>
                    No messages yet
                  </div>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2 }}>
                    Be the first to speak
                  </div>
                </div>
              )}

              {messages.map((msg) => {
                const isOwn = msg.userId === user?.id;
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: isOwn ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      alignSelf: isOwn ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {/* Author + time */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: 8, marginBottom: 4,
                      flexDirection: isOwn ? 'row-reverse' : 'row',
                    }}>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: isOwn ? '#006e27' : '#004fe6',
                      }}>
                        {isOwn ? 'Me' : (msg.user?.username || 'Unknown')}
                      </span>
                      <span style={{ fontSize: 10, color: '#6b7c68' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Bubble */}
                    <div style={{
                      padding: '16px',
                      background: isOwn ? '#00ff66' : '#004fe6',
                      color: isOwn ? '#1b1b1b' : '#fff',
                      border: neo.border,
                      boxShadow: isOwn ? neo.shadowLg : neo.shadow,
                      position: 'relative',
                      transition: 'all 0.1s',
                      maxWidth: '100%',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translate(-2px, -2px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'none';
                    }}
                    >
                      <p style={{ fontSize: 16, lineHeight: 1.5, wordBreak: 'break-word', margin: 0 }}>
                        {msg.content}
                      </p>
                      {isOwn && (
                        <div style={{
                          marginTop: 8, paddingTop: 8,
                          borderTop: '2px solid #1b1b1b',
                          textAlign: 'right', fontSize: 10, color: '#3b4b3a',
                        }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef}/>
            </div>

            {/* Typing indicator */}
            <div style={{ padding: '0 32px', height: 20, display: 'flex', alignItems: 'center' }}>
              {typingUsers.size > 0 && (
                <span style={{
                  fontSize: 11, color: '#6b7c68',
                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2,
                }}>
                  ✍ Someone is typing...
                </span>
              )}
            </div>

            {/* Input */}
            <footer style={{
              padding: '24px 32px', background: '#f9f9f9',
              borderTop: neo.border,
            }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <textarea
                    style={{
                      width: '100%', background: '#fff',
                      border: neo.border, padding: '16px',
                      fontFamily: neo.font, fontSize: 15,
                      resize: 'none', outline: 'none',
                      minHeight: 60, boxSizing: 'border-box',
                      transition: 'all 0.1s', color: '#1b1b1b',
                    }}
                    placeholder={`Message #${currentRoom.name}...`}
                    value={newMessage}
                    rows={1}
                    onChange={(e) => {
                      handleTyping(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#004fe6';
                      e.target.style.boxShadow = neo.shadow;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#1b1b1b';
                      e.target.style.boxShadow = 'none';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>

                {/* Send button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  style={{
                    background: newMessage.trim() ? '#00ff66' : '#e2e2e2',
                    border: neo.border,
                    padding: '16px 20px',
                    boxShadow: newMessage.trim() ? neo.shadow : 'none',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', transition: 'all 0.1s',
                    fontSize: 20,
                  }}
                  onMouseEnter={(e) => {
                    if (newMessage.trim()) {
                      (e.currentTarget as HTMLElement).style.transform = 'translate(4px, 4px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'none';
                    (e.currentTarget as HTMLElement).style.boxShadow = newMessage.trim() ? neo.shadow : 'none';
                  }}
                >
                  ➤
                </button>
              </div>
            </footer>
          </>
        ) : (
          /* No room selected */
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column', gap: 16,
          }}>
            <div style={{
              border: neo.border, padding: '48px 64px',
              boxShadow: neo.shadowLg, background: '#fff',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>💬</div>
              <div style={{
                fontSize: 24, fontWeight: 900, letterSpacing: -0.5, marginBottom: 8,
              }}>
                WELCOME TO CHATSPHERE
              </div>
              <div style={{ fontSize: 13, color: '#3b4b3a', marginBottom: 24, textTransform: 'uppercase', letterSpacing: 2 }}>
                Select a room to start chatting
              </div>
              <button
                onClick={() => setShowCreateRoom(true)}
                style={{
                  background: '#006e27', color: '#fff',
                  border: neo.border, padding: '12px 24px',
                  fontFamily: neo.font, fontWeight: 700,
                  fontSize: 13, textTransform: 'uppercase',
                  letterSpacing: 2, cursor: 'pointer',
                  boxShadow: neo.shadow, transition: 'all 0.1s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translate(4px, 4px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                  (e.currentTarget as HTMLElement).style.boxShadow = neo.shadow;
                }}
              >
                + Create a Room
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
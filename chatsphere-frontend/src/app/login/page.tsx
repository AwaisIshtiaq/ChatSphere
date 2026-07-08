'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useStore } from '@/store/useStore';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useStore();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 4) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd) && /[^a-zA-Z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthLabels = ['—', 'WEAK', 'FAIR', 'GOOD', 'STRONG'];
  const strengthColors = ['#aaa', '#ff2d2d', '#ffaa00', '#ffaa00', '#c8ff00'];
  const strength = getPasswordStrength(form.password);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister
        ? form
        : { email: form.email, password: form.password };
      const res = await api.post(endpoint, payload);
      setAuth(res.data.user, res.data.token);
      router.push('/chat');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      fontFamily: "'Space Mono', 'IBM Plex Mono', monospace",
      background: '#f5f0e8',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      cursor: 'crosshair',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Grid background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,0,0,0.04) 39px, rgba(0,0,0,0.04) 40px),
          repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,0,0,0.04) 39px, rgba(0,0,0,0.04) 40px)
        `,
      }}/>

      {/* Decorative elements */}
      <div style={{
        position: 'fixed', top: -40, left: -40, width: 200, height: 200,
        background: '#c8ff00', border: '3px solid #0a0a0a',
        transform: 'rotate(12deg)', zIndex: 0,
      }}/>
      <div style={{
        position: 'fixed', bottom: -60, right: -30, width: 160, height: 160,
        background: '#ff2d2d', border: '3px solid #0a0a0a',
        transform: 'rotate(-8deg)', zIndex: 0,
      }}/>

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: 460,
        background: '#f5f0e8', border: '3px solid #0a0a0a',
        boxShadow: '10px 10px 0px #0a0a0a', overflow: 'hidden',
      }}>

        {/* Card Header */}
        <div style={{
          background: '#0a0a0a', color: '#c8ff00',
          padding: '28px 32px 24px', borderBottom: '3px solid #0a0a0a',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 12, right: 16,
            fontSize: '0.7rem', color: '#555', letterSpacing: 2,
          }}>///</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: -1, lineHeight: 1, marginBottom: 6 }}>
            💬 CHATSPHERE
          </div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 4, color: '#777' }}>
            {isRegister ? 'CREATE ACCOUNT' : 'SIGN IN TO CONTINUE'}
          </div>
        </div>

        {/* Card Body */}
        <div style={{ padding: '32px' }}>

          {/* Error */}
          {error && (
            <div style={{
              background: '#ff2d2d', color: '#f5f0e8',
              padding: '12px 16px', border: '3px solid #0a0a0a',
              boxShadow: '4px 4px 0px #0a0a0a', marginBottom: 20,
              fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: 1,
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Username (register only) */}
          {isRegister && (
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: '0.7rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: 3, marginBottom: 6,
              }}>Username</label>
              <input
                style={{
                  width: '100%', padding: '14px 16px',
                  fontFamily: 'inherit', fontSize: '0.95rem',
                  border: '3px solid #0a0a0a', background: '#f5f0e8',
                  color: '#0a0a0a', outline: 'none',
                  boxShadow: '3px 3px 0px #0a0a0a',
                  boxSizing: 'border-box',
                }}
                placeholder="YOUR USERNAME"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                onFocus={(e) => {
                  e.target.style.boxShadow = '6px 6px 0px #c8ff00';
                  e.target.style.transform = 'translate(-2px, -2px)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = '3px 3px 0px #0a0a0a';
                  e.target.style.transform = 'none';
                }}
              />
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block', fontSize: '0.7rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 3, marginBottom: 6,
            }}>Email</label>
            <input
              type="email"
              style={{
                width: '100%', padding: '14px 16px',
                fontFamily: 'inherit', fontSize: '0.95rem',
                border: '3px solid #0a0a0a', background: '#f5f0e8',
                color: '#0a0a0a', outline: 'none',
                boxShadow: '3px 3px 0px #0a0a0a',
                boxSizing: 'border-box', transition: 'all 0.1s',
              }}
              placeholder="YOUR@EMAIL.COM"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              onFocus={(e) => {
                e.target.style.boxShadow = '6px 6px 0px #c8ff00';
                e.target.style.transform = 'translate(-2px, -2px)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = '3px 3px 0px #0a0a0a';
                e.target.style.transform = 'none';
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: isRegister ? 8 : 24 }}>
            <label style={{
              display: 'block', fontSize: '0.7rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 3, marginBottom: 6,
            }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                style={{
                  width: '100%', padding: '14px 48px 14px 16px',
                  fontFamily: 'inherit', fontSize: '0.95rem',
                  border: '3px solid #0a0a0a', background: '#f5f0e8',
                  color: '#0a0a0a', outline: 'none',
                  boxShadow: '3px 3px 0px #0a0a0a',
                  boxSizing: 'border-box', transition: 'all 0.1s',
                }}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                onFocus={(e) => {
                  e.target.style.boxShadow = '6px 6px 0px #c8ff00';
                  e.target.style.transform = 'translate(-2px, -2px)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = '3px 3px 0px #0a0a0a';
                  e.target.style.transform = 'none';
                }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', fontSize: '1rem',
                  color: '#555',
                }}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Password strength (register only) */}
          {isRegister && form.password && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{
                    flex: 1, height: 4,
                    background: i < strength
                      ? strengthColors[strength]
                      : '#ddd',
                    border: '1px solid #0a0a0a',
                    transition: 'all 0.2s',
                  }}/>
                ))}
              </div>
              <div style={{
                fontSize: '0.65rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: 2,
                color: strengthColors[strength],
              }}>
                {strengthLabels[strength]}
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '14px 32px',
              fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 2,
              border: '3px solid #0a0a0a', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '6px 6px 0px #0a0a0a', transition: 'all 0.1s',
              background: loading ? '#999' : '#2563eb', color: '#f5f0e8',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                (e.target as HTMLElement).style.transform = 'translate(-3px, -3px)';
                (e.target as HTMLElement).style.boxShadow = '9px 9px 0px #0a0a0a';
              }
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = 'none';
              (e.target as HTMLElement).style.boxShadow = '6px 6px 0px #0a0a0a';
            }}
          >
            {loading ? 'PLEASE WAIT...' : isRegister ? '→ CREATE ACCOUNT' : '→ SIGN IN'}
          </button>

          {/* Divider */}
          <hr style={{ border: 'none', borderTop: '3px solid #0a0a0a', margin: '20px 0' }}/>

          {/* Toggle */}
          <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>
            {isRegister ? 'ALREADY HAVE AN ACCOUNT? ' : "DON'T HAVE AN ACCOUNT? "}
            <span
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              style={{
                fontWeight: 700, cursor: 'pointer',
                borderBottom: '2px solid #c8ff00',
                transition: 'all 0.1s',
              }}
            >
              {isRegister ? 'SIGN IN' : 'REGISTER'}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
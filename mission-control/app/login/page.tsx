'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isLogin ? 'login' : 'register',
          email,
          password,
          name: isLogin ? undefined : name
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Mission Control</h1>
          <p style={{ color: '#8b949e', fontSize: '14px' }}>
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(248,81,73,0.15)', 
            border: '1px solid #f85149',
            borderRadius: '8px', 
            padding: '12px', 
            marginBottom: '20px',
            color: '#f85149',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={formGroup}>
              <label style={label}>Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Your name" 
                style={input}
                required={!isLogin}
              />
            </div>
          )}
          <div style={formGroup}>
            <label style={label}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="you@company.com" 
              style={input} 
              required 
            />
          </div>
          <div style={formGroup}>
            <label style={label}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              style={input} 
              required 
              minLength={6}
            />
          </div>
          <button 
            type="submit" 
            style={{
              ...primaryBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <span style={{ color: '#8b949e', fontSize: '14px' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#2f81f7', 
              cursor: 'pointer',
              fontSize: '14px',
              padding: 0
            }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #21262d' }}>
          <Link href="/dashboard" style={{ color: '#8b949e', fontSize: '12px', textDecoration: 'none' }}>
            Skip for now →
          </Link>
        </div>
      </div>
    </div>
  );
}

const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#0d1117',
  padding: '20px'
};

const card = {
  width: '100%',
  maxWidth: '400px',
  background: '#161b22',
  borderRadius: '12px',
  padding: '40px',
  border: '1px solid #21262d'
};

const formGroup = {
  marginBottom: '20px'
};

const label = {
  display: 'block',
  marginBottom: '8px',
  color: '#c9d1d9',
  fontSize: '14px',
  fontWeight: 500
};

const input = {
  width: '100%',
  padding: '12px 16px',
  background: '#0d1117',
  border: '1px solid #30363d',
  borderRadius: '8px',
  color: '#f0f6fc',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box' as const
};

const primaryBtn = {
  width: '100%',
  padding: '14px',
  background: '#238636',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer'
};

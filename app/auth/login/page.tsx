'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { colors } from '@/app/modules/improv/design/colors';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      redirect: false
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result?.ok) {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
      <div className="w-full max-w-md p-8 rounded-lg" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
        <h1 className="text-3xl font-bold mb-6" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
          Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 rounded border"
            style={{ borderColor: colors.border, color: colors.text }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 rounded border"
            style={{ borderColor: colors.border, color: colors.text }}
            required
          />

          {error && <div style={{ color: '#ef4444' }}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded font-semibold"
            style={{ backgroundColor: colors.teal.bg, color: colors.text, opacity: loading ? 0.5 : 1 }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ color: colors.text2, marginTop: '1rem', textAlign: 'center' }}>
          Don't have an account? <a href="/auth/signup" style={{ color: colors.teal.accent, textDecoration: 'underline' }}>Sign up</a>
        </p>
      </div>
    </div>
  );
}

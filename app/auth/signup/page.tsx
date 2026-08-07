'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { colors } from '@/app/design/colors';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', name: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      setSuccess('Check your email to verify your account!');
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
      <div className="w-full max-w-md p-8 rounded-lg" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
        <h1 className="text-3xl font-bold mb-6" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
          Create Account
        </h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 rounded border"
            style={{ borderColor: colors.border, color: colors.text }}
            required
          />
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
          {success && <div style={{ color: '#4DAB7E' }}>{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded font-semibold"
            style={{ backgroundColor: colors.teal.bg, color: colors.text, opacity: loading ? 0.5 : 1 }}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ color: colors.text2, marginTop: '1rem', textAlign: 'center' }}>
          Already have an account? <a href="/auth/login" style={{ color: colors.teal.accent, textDecoration: 'underline' }}>Login</a>
        </p>
      </div>
    </div>
  );
}

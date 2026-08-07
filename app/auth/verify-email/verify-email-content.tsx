'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { colors } from '@/app/design/colors';

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError('No verification token provided');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Verification failed');
          return;
        }

        setSuccess('Email verified! Redirecting to login...');
        setTimeout(() => router.push('/auth/login'), 2000);
      } catch (err) {
        setError('An error occurred during verification');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
      <div className="w-full max-w-md p-8 rounded-lg text-center" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
        <h1 className="text-3xl font-bold mb-6" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
          Verify Email
        </h1>

        {loading && <p style={{ color: colors.text2 }}>Verifying your email...</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}
        {success && <p style={{ color: '#4DAB7E' }}>{success}</p>}
      </div>
    </div>
  );
}

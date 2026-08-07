'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './link-child.module.css';

export default function LinkChildPage() {
  const router = useRouter();
  const [linkingCode, setLinkingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!linkingCode || linkingCode.length < 6) {
      setError('Please enter a valid linking code');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/parents/link-child', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: linkingCode.toUpperCase(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to link child');
        return;
      }

      const data = await response.json();
      setSuccess(`Successfully linked! ${data.message}`);
      setTimeout(() => {
        router.push('/parents/my-children');
      }, 2000);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Link Your Child</h1>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <div className={styles.content}>
          <div className={styles.section}>
            <h2 className={styles.heading}>How It Works</h2>
            <ol className={styles.steps}>
              <li>Your child's school provides a linking code</li>
              <li>Enter the code below to connect your account</li>
              <li>Start tracking your child's progress</li>
            </ol>
          </div>

          <form onSubmit={handleLink} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="code">Linking Code</label>
              <input
                id="code"
                type="text"
                value={linkingCode}
                onChange={(e) => setLinkingCode(e.target.value.toUpperCase())}
                placeholder="A1B2C3D4"
                maxLength={8}
                disabled={loading}
                autoFocus
              />
              <small>6-8 character code provided by school</small>
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? 'Linking...' : 'Link Child'}
            </button>
          </form>

          <div className={styles.section}>
            <h3 className={styles.subHeading}>Don't have a code?</h3>
            <p className={styles.text}>
              Contact your child's teacher or school administrator to request a parent linking code.
              They'll provide you with a unique code to connect your account.
            </p>
          </div>

          <div className={styles.footer}>
            <Link href="/parents/my-children" className={styles.link}>
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

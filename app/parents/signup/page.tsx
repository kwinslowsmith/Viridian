'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './signup.module.css';

export default function ParentSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'signup' | 'verify' | 'link'>('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Signup form
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  // Verification
  const [verificationCode, setVerificationCode] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Linking
  const [linkingCode, setLinkingCode] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/parent-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Signup failed');
        return;
      }

      const data = await response.json();
      setUserEmail(formData.email);
      setSuccess('Account created! Check your email to verify.');
      setStep('verify');
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          token: verificationCode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Verification failed');
        return;
      }

      setSuccess('Email verified! Now link your child.');
      setStep('link');
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/parents/link-child', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: linkingCode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Linking failed');
        return;
      }

      setSuccess('Successfully linked! Redirecting...');
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
        <h1 className={styles.title}>Parent Portal Setup</h1>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        {step === 'signup' && (
          <form onSubmit={handleSignup} className={styles.form}>
            <h2 className={styles.stepTitle}>Create Your Account</h2>
            <p className={styles.stepDesc}>
              Set up your parent account to track your child's progress.
            </p>

            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Parent"
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="parent@example.com"
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 8 characters"
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm password"
                disabled={loading}
              />
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className={styles.link}>
              Already have an account?{' '}
              <Link href="/auth/login">Sign in here</Link>
            </p>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerify} className={styles.form}>
            <h2 className={styles.stepTitle}>Verify Your Email</h2>
            <p className={styles.stepDesc}>
              We've sent a verification code to <strong>{userEmail}</strong>
            </p>

            <div className={styles.formGroup}>
              <label htmlFor="code">Verification Code</label>
              <input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={32}
                disabled={loading}
              />
              <small>Copy the code from the email verification link</small>
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            <button
              type="button"
              className={styles.buttonSecondary}
              onClick={() => setStep('signup')}
              disabled={loading}
            >
              Back
            </button>
          </form>
        )}

        {step === 'link' && (
          <form onSubmit={handleLinkChild} className={styles.form}>
            <h2 className={styles.stepTitle}>Link to Your Child</h2>
            <p className={styles.stepDesc}>
              Enter the linking code your child's school provided, or that you requested from the teacher.
            </p>

            <div className={styles.infoBox}>
              <strong>How to get a linking code:</strong>
              <ul>
                <li>Ask your child's teacher for a parent linking code</li>
                <li>Or contact the school admin</li>
              </ul>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="linkingCode">Linking Code</label>
              <input
                id="linkingCode"
                type="text"
                value={linkingCode}
                onChange={(e) => setLinkingCode(e.target.value.toUpperCase())}
                placeholder="A1B2C3"
                maxLength={8}
                disabled={loading}
              />
              <small>6-character code (letters and numbers)</small>
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? 'Linking...' : 'Link Child'}
            </button>

            <button
              type="button"
              className={styles.buttonSecondary}
              onClick={() => setStep('verify')}
              disabled={loading}
            >
              Back
            </button>

            <p className={styles.link}>
              You can also link later from your dashboard
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { colors } from '@/app/design/colors';

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <nav
      style={{
        backgroundColor: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {/* Logo */}
      <Link
        href="/polymath"
        style={{
          fontSize: '20px',
          fontWeight: 'bold',
          textDecoration: 'none',
          color: colors.text,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '24px' }}>🌱</span>
        <span>Polymath</span>
      </Link>

      {/* Right Section */}
      {session ? (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: colors.text2 }}>
            {session.user?.name || session.user?.email}
          </span>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              style={{
                padding: '8px 12px',
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.text,
              }}
            >
              Menu ▼
            </button>

            {profileMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  marginTop: '8px',
                  minWidth: '150px',
                  zIndex: 100,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <Link
                  href="/polymath/profile"
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: colors.text,
                    textDecoration: 'none',
                    fontSize: '14px',
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    color: colors.red.accent,
                    fontSize: '14px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Link
          href="/auth/signin"
          style={{
            padding: '8px 12px',
            backgroundColor: colors.teal.accent,
            color: colors.surface,
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Sign In
        </Link>
      )}
    </nav>
  );
};

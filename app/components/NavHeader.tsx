'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { colors } from '@/app/modules/improv/design/colors';
import { useState, useEffect } from 'react';

export function NavHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [approvalCount, setApprovalCount] = useState(0);
  const [showPolymathDropdown, setShowPolymathDropdown] = useState(false);

  // Fetch approval count
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchApprovalCount = async () => {
      try {
        const response = await fetch('/api/polymath/approval-queue?contentType=articles&limit=1');
        if (response.ok) {
          const data = await response.json();
          setApprovalCount((data.queue || data.articles || []).length);
        }
      } catch (err) {
        console.error('Failed to fetch approval count:', err);
      }
    };

    fetchApprovalCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchApprovalCount, 30000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  // Don't show nav on auth pages or home page
  if (!session || pathname === '/' || pathname.startsWith('/auth')) {
    return null;
  }

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <header
      style={{
        backgroundColor: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo/Home */}
        <Link
          href="/"
          className="text-2xl font-bold"
          style={{
            color: colors.text,
            fontFamily: "'DM Serif Display', serif",
            textDecoration: 'none',
          }}
        >
          Viridian
        </Link>

        {/* Navigation Links */}
        <nav className="flex gap-6 items-center flex-1 justify-center">
          <Link
            href="/dashboard"
            className="font-semibold text-sm transition-colors"
            style={{
              color: isActive('/dashboard') ? colors.teal.accent : colors.text,
              textDecoration: 'none',
            }}
          >
            Dashboard
          </Link>
          <Link
            href="/discover"
            className="font-semibold text-sm transition-colors"
            style={{
              color: isActive('/discover') ? colors.teal.accent : colors.text,
              textDecoration: 'none',
            }}
          >
            Communities
          </Link>
          <Link
            href="/discover-organizations"
            className="font-semibold text-sm transition-colors"
            style={{
              color: isActive('/discover-organizations') ? colors.teal.accent : colors.text,
              textDecoration: 'none',
            }}
          >
            Organizations
          </Link>
          <Link
            href="/curator"
            className="font-semibold text-sm transition-colors"
            style={{
              color: isActive('/curator') ? colors.teal.accent : colors.text,
              textDecoration: 'none',
            }}
          >
            Create
          </Link>
          <Link
            href="/library"
            className="font-semibold text-sm transition-colors"
            style={{
              color: isActive('/library') ? colors.teal.accent : colors.text,
              textDecoration: 'none',
            }}
          >
            Library
          </Link>
          <Link
            href="/student/calendar"
            className="font-semibold text-sm transition-colors"
            style={{
              color: isActive('/student/calendar') ? colors.teal.accent : colors.text,
              textDecoration: 'none',
            }}
          >
            Calendar
          </Link>
          <div
            className="relative"
            onMouseEnter={() => setShowPolymathDropdown(true)}
            onMouseLeave={() => setShowPolymathDropdown(false)}
          >
            <Link
              href="/polymath"
              className="font-semibold text-sm transition-colors px-3 py-1 rounded flex items-center gap-2"
              style={{
                color: isActive('/polymath') ? colors.text : colors.text,
                backgroundColor: isActive('/polymath') ? colors.amber.bg : 'transparent',
                textDecoration: 'none',
              }}
            >
              Polymath
              {approvalCount > 0 && (
                <span
                  className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full"
                  style={{ backgroundColor: '#D4A574' }}
                >
                  {approvalCount}
                </span>
              )}
            </Link>
            {showPolymathDropdown && approvalCount > 0 && (
              <div
                className="absolute top-full mt-1 left-0 bg-white rounded shadow-lg border z-50"
                style={{ borderColor: colors.border }}
              >
                <Link
                  href="/polymath/approvals"
                  className="block px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
                  style={{
                    color: isActive('/polymath/approvals') ? '#D4A574' : colors.text,
                    textDecoration: 'none',
                  }}
                >
                  Approval Queue ({approvalCount})
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="flex items-center gap-4">
          <div className="text-sm" style={{ color: colors.text2 }}>
            {session?.user?.name || session?.user?.email}
          </div>
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
            className="px-4 py-2 rounded text-sm font-semibold border"
            style={{
              borderColor: colors.border,
              color: colors.text,
              textDecoration: 'none',
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export function PolymathLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [communitiesDropdownOpen, setCommunitiesDropdownOpen] = useState(false);

  const communities = [
    { id: 1, name: 'Boston K-8 Curriculum', slug: 'boston-k8' },
    { id: 2, name: 'STEM Educators Network', slug: 'stem-network' },
    { id: 3, name: 'Social Justice Learning', slug: 'social-justice' },
  ];

  const navigationItems = [
    { label: 'Dashboard', href: '/polymath', icon: '📊' },
    { label: 'Communities', href: '/polymath/communities', icon: '👥' },
    { label: 'Resources', href: '/polymath/resources', icon: '📚' },
    { label: 'Discussions', href: '/polymath/discussions', icon: '💬' },
    { label: 'Meetings', href: '/polymath/meetings', icon: '📅' },
    { label: 'Profile', href: '/polymath/profile', icon: '👤' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafaf7' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? '280px' : '80px',
          backgroundColor: '#1c1917',
          color: '#fff',
          padding: '20px',
          transition: 'width 0.3s ease',
          borderRight: '1px solid #333',
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span>🌱</span>
          {sidebarOpen && <span>Polymath</span>}
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: '12px 16px',
                textDecoration: 'none',
                color: '#fff',
                fontSize: '14px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            marginTop: 'auto',
            padding: '10px',
            backgroundColor: '#333',
            border: 'none',
            color: '#fff',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Navbar */}
        <nav
          style={{
            backgroundColor: '#fff',
            borderBottom: '1px solid #e5e0d8',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Communities Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setCommunitiesDropdownOpen(!communitiesDropdownOpen)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#f9f7f4',
                border: '1px solid #e5e0d8',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#1c1917',
              }}
            >
              Communities ▼
            </button>

            {communitiesDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  backgroundColor: '#fff',
                  border: '1px solid #e5e0d8',
                  borderRadius: '6px',
                  marginTop: '8px',
                  minWidth: '200px',
                  zIndex: 100,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                {communities.map((community) => (
                  <Link
                    key={community.id}
                    href={`/polymath/communities/${community.slug}`}
                    style={{
                      display: 'block',
                      padding: '12px 16px',
                      color: '#1c1917',
                      textDecoration: 'none',
                      fontSize: '14px',
                      borderBottom: '1px solid #e5e0d8',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9f7f4';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {community.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Profile & Logout */}
          {session ? (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>
                {session.user?.name || session.user?.email}
              </span>
              <Link
                href="/polymath/profile"
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f9f7f4',
                  border: '1px solid #e5e0d8',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: '#1c1917',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Profile
              </Link>
              <button
                onClick={() => signOut()}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              style={{
                padding: '8px 12px',
                backgroundColor: '#0d9488',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            >
              Login
            </Link>
          )}
        </nav>

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

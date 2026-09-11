'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { colors } from '@/app/design/colors';

const navigationItems = [
  { label: 'Dashboard', href: '/polymath', icon: '📊' },
  { label: 'Communities', href: '/polymath/communities', icon: '👥' },
  { label: 'Resources', href: '/polymath/resources', icon: '📚' },
  { label: 'Discussions', href: '/polymath/discussions', icon: '💬' },
  { label: 'Meetings', href: '/polymath/meetings', icon: '📅' },
  { label: 'Profile', href: '/polymath/profile', icon: '👤' },
];

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <aside
      style={{
        width: isOpen ? '280px' : '80px',
        backgroundColor: '#1c1917',
        color: '#fff',
        padding: '20px',
        transition: 'width 0.3s ease',
        borderRight: '1px solid #333',
        overflowY: 'auto',
        minHeight: '100vh',
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
        {isOpen && <span>Polymath</span>}
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
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
                backgroundColor: isActive ? '#333' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#333';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {isOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        style={{
          marginTop: 'auto',
          padding: '10px',
          backgroundColor: '#333',
          border: 'none',
          color: '#fff',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px',
          width: '100%',
        }}
      >
        {isOpen ? '◀' : '▶'}
      </button>
    </aside>
  );
};

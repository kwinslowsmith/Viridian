'use client';

import { Navbar } from '@/app/components/polymath/Navbar';
import { Sidebar } from '@/app/components/polymath/Sidebar';

export default function PolymathLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafaf7' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Navbar */}
        <Navbar />

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

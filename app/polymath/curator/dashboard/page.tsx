'use client';

import React from 'react';
import { CuratorDashboard } from '@/app/components/polymath';

export default function CuratorDashboardPage() {
  return (
    <div className="min-h-screen bg-[#F9F9F9] py-8 px-4">
      <CuratorDashboard
        communityName="Community Dashboard"
      />
    </div>
  );
}

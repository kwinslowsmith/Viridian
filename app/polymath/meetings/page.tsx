'use client';

import React, { useState } from 'react';
import { MeetingList, ScheduleMeetingForm } from '@/app/components/polymath';

export default function MeetingsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateMeeting = () => {
    setShowCreateForm(false);
    // TODO: API call to create meeting
  };

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] py-8 px-4">
        <ScheduleMeetingForm
          onSubmit={handleCreateMeeting}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] py-8 px-4">
      <MeetingList
        onCreateMeeting={() => setShowCreateForm(true)}
        onJoinMeeting={(id) => console.log('Join meeting:', id)}
        onEditMeeting={(id) => console.log('Edit meeting:', id)}
        onDeleteMeeting={(id) => console.log('Delete meeting:', id)}
      />
    </div>
  );
}

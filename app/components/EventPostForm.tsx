'use client';

import React, { useState, useEffect } from 'react';
import { PolymathButton } from './PolymathButton';
import { StatusBadge } from './StatusBadge';
import { ContentForm } from './ContentForm';

interface EventOption {
  id: string;
  name: string;
  date: string;
  location: string;
  attendeeCount?: number;
}

interface EventPostFormProps {
  userId: string;
  onSuccess?: (postId: string) => void;
}

type ResourceType = 'Keynote' | 'Handout' | 'Recording' | 'Slides' | 'Transcript' | 'Other';
type VisibilityType = 'attendees_only' | 'public';

interface FormData {
  eventId: string;
  title: string;
  content: string;
  resourceType: ResourceType;
  visibility: VisibilityType;
}

export const EventPostForm: React.FC<EventPostFormProps> = ({
  userId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    eventId: '',
    title: '',
    content: '',
    resourceType: 'Keynote',
    visibility: 'attendees_only',
  });

  const [events, setEvents] = useState<EventOption[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch user's events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        // Mock data for now - replace with actual API call
        const mockEvents: EventOption[] = [
          {
            id: '1',
            name: 'Annual EdTech Summit 2026',
            date: '2026-09-15',
            location: 'San Francisco, CA',
            attendeeCount: 500,
          },
          {
            id: '2',
            name: 'Python Workshop Series',
            date: '2026-08-20',
            location: 'Virtual',
            attendeeCount: 120,
          },
          {
            id: '3',
            name: 'Teaching AI Masterclass',
            date: '2026-10-01',
            location: 'New York, NY',
            attendeeCount: 75,
          },
        ];
        setEvents(mockEvents);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [userId]);

  const selectedEvent = events.find((e) => e.id === formData.eventId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.eventId || !formData.title.trim() || !formData.content.trim()) {
      setErrorMessage('Please fill in all required fields');
      setStatus('error');
      return;
    }

    try {
      setStatus('loading');
      setErrorMessage('');

      const response = await fetch('/api/polymath/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          authorType: 'event',
          authorId: formData.eventId,
          eventId: formData.eventId,
          resourceType: formData.resourceType,
          status: 'published',
          visibility: formData.visibility === 'attendees_only' ? 'class' : 'public',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to publish event resource');
      }

      const post = await response.json();
      setStatus('success');

      // Reset form
      setFormData({
        eventId: '',
        title: '',
        content: '',
        resourceType: 'Keynote',
        visibility: 'attendees_only',
      });

      onSuccess?.(post.id);

      // Clear success message after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
      setStatus('error');
    }
  };

  const resourceTypes: ResourceType[] = ['Keynote', 'Handout', 'Recording', 'Slides', 'Transcript', 'Other'];

  return (
    <div className="space-y-6">
      {/* Event Selection Header */}
      {selectedEvent && (
        <div className="bg-[#F5F3F0] border border-[#B8A899]/20 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-[#3C3C3C] mb-1">{selectedEvent.name}</h3>
              <div className="text-xs text-[#B8A899] space-y-1">
                <p>📅 {new Date(selectedEvent.date).toLocaleDateString()}</p>
                <p>📍 {selectedEvent.location}</p>
                {selectedEvent.attendeeCount && <p>👥 {selectedEvent.attendeeCount} attendees</p>}
              </div>
            </div>
            <StatusBadge authorType="event" size="sm" />
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Event Selection */}
        <div>
          <label htmlFor="event" className="block text-sm font-medium text-[#3C3C3C] mb-2">
            Select Event <span className="text-red-500">*</span>
          </label>
          <select
            id="event"
            value={formData.eventId}
            onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
            className="w-full px-4 py-2 border border-[#B8A899]/20 rounded-lg font-sans text-sm text-[#3C3C3C] focus:outline-none focus:ring-2 focus:ring-[#8B3A3A] focus:border-transparent"
          >
            <option value="">Choose an event...</option>
            {loadingEvents ? (
              <option disabled>Loading events...</option>
            ) : events.length === 0 ? (
              <option disabled>No events available</option>
            ) : (
              events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name} ({new Date(event.date).toLocaleDateString()})
                </option>
              ))
            )}
          </select>
          <p className="text-xs text-[#B8A899] mt-2">
            💡 Select the event this resource is associated with
          </p>
        </div>

        {/* Resource Type */}
        <div>
          <label htmlFor="resourceType" className="block text-sm font-medium text-[#3C3C3C] mb-2">
            Resource Type <span className="text-red-500">*</span>
          </label>
          <select
            id="resourceType"
            value={formData.resourceType}
            onChange={(e) => setFormData({ ...formData, resourceType: e.target.value as ResourceType })}
            className="w-full px-4 py-2 border border-[#B8A899]/20 rounded-lg font-sans text-sm text-[#3C3C3C] focus:outline-none focus:ring-2 focus:ring-[#8B3A3A] focus:border-transparent"
          >
            {resourceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-[#3C3C3C] mb-2">
            Resource Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Give your event resource a descriptive title"
            className="w-full px-4 py-2 border border-[#B8A899]/20 rounded-lg font-sans text-sm text-[#3C3C3C] placeholder-[#B8A899] focus:outline-none focus:ring-2 focus:ring-[#8B3A3A] focus:border-transparent"
            maxLength={200}
          />
          <p className="text-xs text-[#B8A899] mt-1">{formData.title.length}/200 characters</p>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-[#3C3C3C] mb-2">
            Content / Description <span className="text-red-500">*</span>
          </label>
          <ContentForm
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            placeholder="Describe your event resource, include key takeaways, links, or instructions..."
          />
        </div>

        {/* Visibility Toggle */}
        <div>
          <label className="block text-sm font-medium text-[#3C3C3C] mb-3">
            Visibility <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="attendees_only"
                checked={formData.visibility === 'attendees_only'}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value as VisibilityType })}
                className="w-4 h-4"
              />
              <div>
                <span className="text-[#3C3C3C] font-medium">🔒 Attendees Only</span>
                <p className="text-xs text-[#B8A899]">Only event attendees can access this resource</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={formData.visibility === 'public'}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value as VisibilityType })}
                className="w-4 h-4"
              />
              <div>
                <span className="text-[#3C3C3C] font-medium">🌍 Public</span>
                <p className="text-xs text-[#B8A899]">Anyone can view this resource</p>
              </div>
            </label>
          </div>
        </div>

        {/* Error Message */}
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Success Message */}
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg flex items-center gap-2">
            <span>✓ Published!</span>
            <span className="text-xs">Your event resource is now available.</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <PolymathButton
            type="submit"
            variant="primary"
            size="lg"
            isFullWidth
            disabled={status === 'loading' || !formData.eventId}
          >
            {status === 'loading' ? '⏳ Publishing...' : '✓ Publish Now'}
          </PolymathButton>
        </div>

        {/* Info text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
          <p className="font-medium mb-1">📋 Event Resource Publishing:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-600">
            <li>Your resource will be published immediately to the event</li>
            <li>Attendees can access based on visibility settings</li>
            <li>You can edit or delete it anytime</li>
            <li>Resources stay available after the event for archival</li>
          </ul>
        </div>
      </form>
    </div>
  );
};

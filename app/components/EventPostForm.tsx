'use client';

import React, { useState, useEffect } from 'react';
import { PolymathButton } from './PolymathButton';
import { StatusBadge } from './StatusBadge';
import { ContentForm } from './ContentForm';
import { Toast } from './Toast';
import { validateEventArticle, hasErrors, FormErrors } from '@/lib/polymath/form-validation';

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
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  // Validate form on field change
  const validateForm = (data: FormData) => {
    return validateEventArticle({
      eventId: data.eventId,
      title: data.title,
      content: data.content,
      resourceType: data.resourceType,
      visibility: data.visibility,
    });
  };

  // Handle field blur - validate and mark as touched
  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields((prev) => new Set(prev).add(fieldName));
    const newErrors = validateForm(formData);
    setErrors(newErrors);
  };

  // Handle field change with debounced validation
  const handleFieldChange = (field: keyof FormData, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Validate only if field has been touched
    if (touchedFields.has(field)) {
      const newErrors = validateForm(newFormData);
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouchedFields(new Set(['eventId', 'title', 'content', 'resourceType', 'visibility']));

    // Validate form
    const formErrors = validateForm(formData);
    setErrors(formErrors);

    if (hasErrors(formErrors)) {
      setToast({
        message: 'Please fix validation errors before submitting',
        type: 'error',
      });
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmedSubmit = async () => {
    setShowConfirmDialog(false);

    try {
      setStatus('loading');
      setErrorMessage('');

      const response = await fetch('/api/polymath/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-User-Id': userId,
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          authorType: 'event',
          authorId: formData.eventId,
          eventId: formData.eventId,
          visibility: formData.visibility === 'attendees_only' ? 'event' : 'public',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to publish event resource');
      }

      const post = await response.json();
      setStatus('success');

      // Show success toast
      setToast({
        message: 'Resource published successfully!',
        type: 'success',
      });

      // Reset form
      setFormData({
        eventId: '',
        title: '',
        content: '',
        resourceType: 'Keynote',
        visibility: 'attendees_only',
      });
      setErrors({});
      setTouchedFields(new Set());

      onSuccess?.(post.id);

      // Clear success message after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An error occurred while publishing';
      setErrorMessage(errorMsg);
      setStatus('error');
      setToast({
        message: errorMsg,
        type: 'error',
      });
    }
  };

  const resourceTypes: ResourceType[] = ['Keynote', 'Handout', 'Recording', 'Slides', 'Transcript', 'Other'];

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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
            onChange={(e) => {
              handleFieldChange('eventId', e.target.value);
              handleFieldBlur('eventId');
            }}
            className={`w-full px-4 py-2 border rounded-lg font-sans text-sm text-[#3C3C3C] focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
              touchedFields.has('eventId') && errors.eventId
                ? 'border-red-300 focus:ring-red-300 bg-red-50'
                : 'border-[#B8A899]/20 focus:ring-[#8B3A3A]'
            }`}
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
          {touchedFields.has('eventId') && errors.eventId && (
            <p className="text-xs text-red-600 font-medium mt-1">✕ {errors.eventId}</p>
          )}
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
            onChange={(e) => {
              handleFieldChange('resourceType', e.target.value as ResourceType);
              handleFieldBlur('resourceType');
            }}
            className={`w-full px-4 py-2 border rounded-lg font-sans text-sm text-[#3C3C3C] focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
              touchedFields.has('resourceType') && errors.resourceType
                ? 'border-red-300 focus:ring-red-300 bg-red-50'
                : 'border-[#B8A899]/20 focus:ring-[#8B3A3A]'
            }`}
          >
            {resourceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {touchedFields.has('resourceType') && errors.resourceType && (
            <p className="text-xs text-red-600 font-medium mt-1">✕ {errors.resourceType}</p>
          )}
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
            onChange={(e) => handleFieldChange('title', e.target.value)}
            onBlur={() => handleFieldBlur('title')}
            placeholder="Give your event resource a descriptive title"
            className={`w-full px-4 py-2 border rounded-lg font-sans text-sm text-[#3C3C3C] placeholder-[#B8A899] focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
              touchedFields.has('title') && errors.title
                ? 'border-red-300 focus:ring-red-300 bg-red-50'
                : 'border-[#B8A899]/20 focus:ring-[#8B3A3A]'
            }`}
            maxLength={200}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-[#B8A899]">{formData.title.length}/200 characters</p>
            {touchedFields.has('title') && errors.title && (
              <p className="text-xs text-red-600 font-medium">✕ {errors.title}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-[#3C3C3C] mb-2">
            Content / Description <span className="text-red-500">*</span>
          </label>
          <div className={`rounded-lg overflow-hidden border ${
            touchedFields.has('content') && errors.content
              ? 'border-red-300 bg-red-50'
              : 'border-[#B8A899]/20'
          }`}>
            <ContentForm
              value={formData.content}
              onChange={(content) => handleFieldChange('content', content)}
              onBlur={() => handleFieldBlur('content')}
              placeholder="Describe your event resource, include key takeaways, links, or instructions..."
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-[#B8A899]">{formData.content.length} characters</p>
            {touchedFields.has('content') && errors.content && (
              <p className="text-xs text-red-600 font-medium">✕ {errors.content}</p>
            )}
          </div>
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
                onChange={(e) => {
                  handleFieldChange('visibility', e.target.value as VisibilityType);
                  handleFieldBlur('visibility');
                }}
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
                onChange={(e) => {
                  handleFieldChange('visibility', e.target.value as VisibilityType);
                  handleFieldBlur('visibility');
                }}
                className="w-4 h-4"
              />
              <div>
                <span className="text-[#3C3C3C] font-medium">🌍 Public</span>
                <p className="text-xs text-[#B8A899]">Anyone can view this resource</p>
              </div>
            </label>
          </div>
          {touchedFields.has('visibility') && errors.visibility && (
            <p className="text-xs text-red-600 font-medium mt-2">✕ {errors.visibility}</p>
          )}
        </div>

        {/* Error Message */}
        {status === 'error' && errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg flex items-start gap-2">
            <span className="text-lg">✕</span>
            <div className="flex-1">
              <p className="font-medium mb-1">Error Publishing Resource</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <PolymathButton
            type="submit"
            variant="primary"
            size="lg"
            isFullWidth
            disabled={status === 'loading' || hasErrors(errors)}
          >
            {status === 'loading' ? '⏳ Publishing...' : '✓ Publish Now'}
          </PolymathButton>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[#3C3C3C] mb-2">Publish Resource?</h3>
                <p className="text-sm text-[#B8A899]">
                  Your event resource will be published and available to {formData.visibility === 'attendees_only' ? 'event attendees only' : 'everyone'}.
                </p>
              </div>

              <div className="bg-[#F5F3F0] rounded-lg p-3 text-sm text-[#3C3C3C]">
                <p className="font-medium mb-2">Preview:</p>
                <p className="line-clamp-2">{formData.title}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 px-4 py-2 border border-[#B8A899]/20 rounded-lg text-[#3C3C3C] font-medium hover:bg-[#F5F3F0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmedSubmit}
                  className="flex-1 px-4 py-2 bg-[#8B3A3A] text-white rounded-lg font-medium hover:bg-[#6B2A2A] transition-colors"
                >
                  Publish
                </button>
              </div>
            </div>
          </div>
        )}

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
    </>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardBody, CardHeader, Button, TextInput, TextArea, LoadingState } from '@/app/components/polymath';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  expertise?: string[];
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expertise, setExpertise] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // For now, use session data
      if (session?.user) {
        setFormData({
          name: session.user.name || '',
          email: session.user.email || '',
          bio: '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Would call API to save profile
      console.log('Saving profile:', formData);
      // Simulate save
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading profile..." />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-[#3C3C3C] mb-8">
        My Profile
      </h1>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-[#3C3C3C]">
            Profile Information
          </h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSave} className="space-y-6">
            <TextInput
              label="Full Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <TextInput
              label="Email Address *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <TextArea
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself and your teaching experience..."
              rows={4}
            />

            <div>
              <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                Expertise Areas
              </label>
              <div className="space-y-2 mb-4">
                {/* Render existing expertise tags */}
                <div className="flex flex-wrap gap-2">
                  {formData.bio && (
                    <span className="inline-block px-3 py-1 bg-[#20B2AA]/20 text-[#20B2AA] text-sm rounded-full">
                      Example Tag
                    </span>
                  )}
                </div>
              </div>
              <TextInput
                placeholder="Add expertise area and press Enter"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
              />
            </div>

            <div className="flex gap-4 pt-6 border-t border-[#E5E5E5]">
              <Button
                type="button"
                variant="secondary"
                onClick={() => fetchProfile()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                isLoading={isSaving}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

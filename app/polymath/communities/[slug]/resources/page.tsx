'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button, LoadingState, EmptyState, Select } from '@/app/components/polymath';
import { ResourceCard } from '@/app/components/polymath/ResourceCard';
import { UploadResourceModal } from '@/app/components/polymath/UploadResourceModal';

interface Resource {
  id: string;
  title: string;
  type: 'lesson' | 'material' | 'article' | 'video' | 'rubric';
  description?: string;
  uploaderName?: string;
  uploadDate?: string;
}

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'lesson', label: 'Lesson Plan' },
  { value: 'material', label: 'Material' },
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Video' },
  { value: 'rubric', label: 'Rubric' },
];

export default function ResourcesPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchResources();
    }
  }, [slug]);

  useEffect(() => {
    const filtered = selectedType
      ? resources.filter((r) => r.type === selectedType)
      : resources;
    setFilteredResources(filtered);
  }, [selectedType, resources]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/communities/${slug}/resources`);
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceUpload = async (resource: any) => {
    try {
      const formData = new FormData();
      formData.append('title', resource.title);
      formData.append('type', resource.type);
      formData.append('description', resource.description);
      if (resource.file) {
        formData.append('file', resource.file);
      }

      const res = await fetch(`/api/communities/${slug}/resources`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to upload resource');
      }

      const data = await res.json();
      setResources((prev) => [data.resource, ...prev]);
    } catch (error) {
      console.error('Failed to upload resource:', error);
      throw error;
    }
  };

  if (loading) {
    return <LoadingState message="Loading resources..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-[#3C3C3C]">Resources</h1>
        <Button onClick={() => setIsUploadModalOpen(true)}>+ Upload Resource</Button>
      </div>

      {/* Filters */}
      <div className="mb-8 max-w-xs">
        <Select
          options={typeOptions}
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          label="Filter by Type"
        />
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <EmptyState
          icon="📚"
          title="No resources yet"
          description="Be the first to share a resource with this community"
          actionLabel="Upload Resource"
          onAction={() => (window.location.href = '#')}
        />
      ) : (
        <>
          <div className="text-sm text-[#666666] mb-6">
            Showing {filteredResources.length} of {resources.length} resources
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                id={resource.id}
                communitySlug={slug}
                title={resource.title}
                type={resource.type}
                description={resource.description}
                uploaderName={resource.uploaderName}
                uploadDate={resource.uploadDate}
              />
            ))}
          </div>
        </>
      )}

      <UploadResourceModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleResourceUpload}
        communitySlug={slug}
      />
    </div>
  );
}

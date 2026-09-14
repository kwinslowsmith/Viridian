'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, LoadingState, EmptyState, Select, Card, CardBody } from '@/app/components/polymath';
import { useCommunityResources, useCreateResource } from '@/hooks/usePolymath';
import { UploadResourceModal } from '@/app/components/polymath/UploadResourceModal';

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'document', label: 'Document' },
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Image' },
  { value: 'link', label: 'Link' },
  { value: 'other', label: 'Other' },
];

export default function ResourcesPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { resources, loading, error, refetch } = useCommunityResources(slug);
  const { create: createResource, loading: creatingResource, error: createError } = useCreateResource(slug);
  const [filteredResources, setFilteredResources] = useState<typeof resources>([]);
  const [selectedType, setSelectedType] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    const filtered = selectedType
      ? resources.filter((r) => r.type === selectedType)
      : resources;
    setFilteredResources(filtered);
  }, [selectedType, resources]);

  const handleResourceUpload = async (data: any) => {
    try {
      await createResource({
        title: data.title,
        type: data.type || 'other',
        description: data.description,
        fileKey: data.fileKey,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
      });
      setIsUploadModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to upload resource:', error);
    }
  };

  if (loading) {
    return <LoadingState message="Loading resources..." />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-red-800 font-medium">Error loading resources</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
        <Link href={`/polymath/communities/${slug}`}>
          <Button>Back to Community</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#3C3C3C] mb-2">Resources</h1>
          <p className="text-[#666666]">{resources.length} resources available</p>
        </div>
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
          title={selectedType ? "No resources of this type" : "No resources yet"}
          description={selectedType ? "Try selecting a different type" : "Be the first to share a resource with this community"}
          actionLabel={!selectedType ? "Upload Resource" : undefined}
          onAction={!selectedType ? () => setIsUploadModalOpen(true) : undefined}
        />
      ) : (
        <>
          <div className="text-sm text-[#666666] mb-6">
            Showing {filteredResources.length} of {resources.length} resources
          </div>
          <div className="space-y-3">
            {filteredResources.map((resource) => (
              <Card key={resource.id}>
                <CardBody>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#3C3C3C]">{resource.title}</h3>
                      {resource.description && (
                        <p className="text-sm text-[#666666] mt-1">{resource.description}</p>
                      )}
                      <p className="text-xs text-[#999999] mt-2">
                        By {resource.createdBy?.name || 'Unknown'} • {new Date(resource.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-xs bg-[#E5E5E5] text-[#3C3C3C] px-2 py-1 rounded whitespace-nowrap capitalize">
                        {resource.type}
                      </span>
                      {resource.url && (
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="secondary">Open</Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </>
      )}

      {createError && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {createError}
        </div>
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

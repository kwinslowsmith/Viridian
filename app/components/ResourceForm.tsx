'use client';

import React, { useState } from 'react';
import { colors } from '@/app/design/colors';

interface ResourceFormProps {
  orgSlug?: string;
  classId?: string;
  communitySlug?: string;
  skills: Array<{ id: string; name: string }>;
  objectives?: Array<{ id: string; text: string; skillId: string }>;
  resource?: any;
  onSuccess: (resource: any) => void;
  onClose: () => void;
}

const RESOURCE_TYPES = ['assessment', 'material', 'tool', 'template', 'link', 'video'];
const FORMATS = ['pdf', 'google-doc', 'video', 'article', 'worksheet', 'spreadsheet', 'other'];

export function ResourceForm({
  orgSlug,
  classId,
  communitySlug,
  skills,
  objectives = [],
  resource,
  onSuccess,
  onClose,
}: ResourceFormProps) {
  const isCommunityResource = communitySlug && communitySlug.length > 0;
  const isClassResource = classId && classId.length > 0;
  const VISIBILITY_OPTIONS = isCommunityResource
    ? ['community']
    : isClassResource
    ? ['class', 'org', 'public']
    : ['org', 'public'];
  const [title, setTitle] = useState(resource?.title || '');
  const [description, setDescription] = useState(resource?.description || '');
  const [type, setType] = useState(resource?.type || 'material');
  const [format, setFormat] = useState(resource?.format || '');
  const [visibility, setVisibility] = useState(
    resource?.visibility || (isCommunityResource ? 'community' : isClassResource ? 'class' : 'org')
  );
  const [tags, setTags] = useState(resource?.tags || '');
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(
    resource?.skills.map((s: any) => s.skill.id) || []
  );
  const [selectedObjectiveIds, setSelectedObjectiveIds] = useState<string[]>(
    resource?.objectives.map((o: any) => o.objective.id) || []
  );

  const [sourceType, setSourceType] = useState<'url' | 'file'>(resource?.url ? 'url' : 'file');
  const [url, setUrl] = useState(resource?.url || '');
  const [fileKey, setFileKey] = useState(resource?.fileKey || '');
  const [fileName, setFileName] = useState(resource?.fileName || '');
  const [fileSize, setFileSize] = useState(resource?.fileSize || 0);
  const [mimeType, setMimeType] = useState(resource?.mimeType || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredObjectives = selectedSkillIds.length > 0
    ? objectives.filter((o) => selectedSkillIds.includes(o.skillId))
    : objectives;

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/resources/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFileKey(data.fileKey);
        setFileName(data.fileName);
        setFileSize(data.fileSize);
        setMimeType(data.mimeType);
      } else {
        const errorData = await res.json();
        setUploadError(errorData.error || 'Failed to upload file');
      }
    } catch (err) {
      setUploadError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !type) {
      setError('Title and type are required');
      return;
    }

    if (sourceType === 'url' && !url.trim()) {
      setError('Please provide a URL or upload a file');
      return;
    }

    if (sourceType === 'file' && !fileKey) {
      setError('Please upload a file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let endpoint: string;
      if (isCommunityResource) {
        endpoint = resource
          ? `/api/communities/${communitySlug}/resources/${resource.id}`
          : `/api/communities/${communitySlug}/resources`;
      } else {
        endpoint = resource
          ? `/api/organizations/${orgSlug}/resources/${resource.id}`
          : `/api/organizations/${orgSlug}/resources`;
      }

      const method = resource ? 'PUT' : 'POST';

      const body = {
        title: title.trim(),
        description: description.trim() || null,
        url: sourceType === 'url' ? url.trim() : null,
        fileKey: sourceType === 'file' ? fileKey : null,
        fileName: sourceType === 'file' ? fileName : null,
        fileSize: sourceType === 'file' ? fileSize : null,
        mimeType: sourceType === 'file' ? mimeType : null,
        type,
        format: format || null,
        visibility,
        classId: classId || null,
        tags: tags.trim() || null,
        skillIds: selectedSkillIds,
        objectiveIds: selectedObjectiveIds,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        onSuccess(data.resource);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to save resource');
      }
    } catch (err) {
      setError('Failed to save resource');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: '8px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '2rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', margin: '0 0 1.5rem 0' }}>
          {resource ? 'Edit Resource' : 'Add Resource'}
        </h2>

        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '0.75rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          {/* Title */}
          <div>
            <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Yes And Warmup Sheet"
              style={{
                width: '100%',
                padding: '8px',
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                color: colors.text,
                backgroundColor: colors.bg,
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a brief description of the resource"
              style={{
                width: '100%',
                padding: '8px',
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                color: colors.text,
                backgroundColor: colors.bg,
                fontSize: '13px',
                boxSizing: 'border-box',
                minHeight: '80px',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Type */}
          <div>
            <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
              Type *
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {RESOURCE_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: type === t ? colors.teal.accent : colors.bg,
                    color: type === t ? 'white' : colors.text,
                    border: `1px solid ${type === t ? colors.teal.accent : colors.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Source Type Toggle */}
          <div>
            <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
              Source *
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  checked={sourceType === 'url'}
                  onChange={() => setSourceType('url')}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ color: colors.text, fontSize: '13px' }}>External URL</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  checked={sourceType === 'file'}
                  onChange={() => setSourceType('file')}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ color: colors.text, fontSize: '13px' }}>Upload File</span>
              </label>
            </div>
          </div>

          {/* URL or File Upload */}
          {sourceType === 'url' ? (
            <div>
              <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                URL *
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://docs.google.com/... or https://..."
                style={{
                  width: '100%',
                  padding: '8px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  color: colors.text,
                  backgroundColor: colors.bg,
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ) : (
            <div>
              <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                File *
              </label>
              {uploadError && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '0.5rem' }}>
                  {uploadError}
                </div>
              )}
              {fileKey ? (
                <div style={{ color: colors.text, fontSize: '13px', backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: '4px' }}>
                  ✓ {fileName}
                </div>
              ) : (
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  disabled={uploading}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '4px',
                    color: colors.text,
                    backgroundColor: colors.bg,
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              )}
              {uploading && <div style={{ color: colors.text2, fontSize: '12px', marginTop: '0.5rem' }}>Uploading...</div>}
            </div>
          )}

          {/* Format */}
          <div>
            <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                color: colors.text,
                backgroundColor: colors.bg,
                fontSize: '13px',
              }}
            >
              <option value="">Select format...</option>
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Visibility */}
          <div>
            <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
              Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                color: colors.text,
                backgroundColor: colors.bg,
                fontSize: '13px',
              }}
            >
              {VISIBILITY_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v === 'public' ? 'Public' : v === 'org' ? 'Organization' : 'Class'}
                </option>
              ))}
            </select>
          </div>

          {/* Skills */}
          <div>
            <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
              Skills
            </label>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {skills.map((skill) => (
                <label key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedSkillIds.includes(skill.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSkillIds([...selectedSkillIds, skill.id]);
                      } else {
                        setSelectedSkillIds(selectedSkillIds.filter((id) => id !== skill.id));
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: colors.text, fontSize: '13px' }}>{skill.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Objectives */}
          {filteredObjectives.length > 0 && (
            <div>
              <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                Objectives
              </label>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {filteredObjectives.map((obj) => (
                  <label key={obj.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedObjectiveIds.includes(obj.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedObjectiveIds([...selectedObjectiveIds, obj.id]);
                        } else {
                          setSelectedObjectiveIds(selectedObjectiveIds.filter((id) => id !== obj.id));
                        }
                      }}
                      style={{ cursor: 'pointer', marginTop: '2px' }}
                    />
                    <span style={{ color: colors.text, fontSize: '13px', lineHeight: '1.4' }}>{obj.text}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., warmup, agreement, beginner"
              style={{
                width: '100%',
                padding: '8px',
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                color: colors.text,
                backgroundColor: colors.bg,
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="submit"
              disabled={loading || uploading}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: colors.teal.accent,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading || uploading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                opacity: loading || uploading ? 0.6 : 1,
              }}
            >
              {loading ? 'Saving...' : resource ? 'Update' : 'Create'} Resource
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: colors.border,
                color: colors.text,
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '13px',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';

interface Objective {
  id: string;
  label: string;
  text: string;
  learningTarget?: string;
  description?: string;
  source?: string;
  sequenceNum: number;
  isMandatory?: boolean;
}

interface ObjectivesPanelProps {
  isOpen: boolean;
  standard: {
    id: string;
    name: string;
    code: string;
    description?: string;
    passPercentage?: number;
    objectives: Objective[];
  } | null;
  onClose: () => void;
  onToggleMandatory?: (objectiveId: string, isMandatory: boolean) => void;
}

export function ObjectivesPanel({
  isOpen,
  standard,
  onClose,
  onToggleMandatory,
}: ObjectivesPanelProps): React.JSX.Element | null {
  const [editMode, setEditMode] = useState(false);

  if (!isOpen || !standard) return null;

  const sorted = standard.objectives.sort((a, b) => a.sequenceNum - b.sequenceNum);
  const mandatory = sorted.filter(obj => obj.isMandatory);
  const optional = sorted.filter(obj => !obj.isMandatory);
  const passPercentage = standard.passPercentage ?? 80;

  const renderObjective = (objective: Objective) => (
    <div
      key={objective.id}
      style={{
        padding: '1rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px',
        border: `1px solid ${objective.isMandatory ? '#ef4444' : '#e0e0e0'}`,
        borderLeft: `3px solid ${objective.isMandatory ? '#ef4444' : '#ccc'}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '0.5rem',
          alignItems: 'flex-start',
        }}
      >
        {editMode && onToggleMandatory && (
          <input
            type="checkbox"
            checked={objective.isMandatory ?? false}
            onChange={(e) => onToggleMandatory(objective.id, e.target.checked)}
            style={{
              cursor: 'pointer',
              marginTop: '4px',
            }}
          />
        )}
        <div
          style={{
            minWidth: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '600',
            flexShrink: 0,
          }}
        >
          {objective.label}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
            <h4
              style={{
                margin: 0,
                fontSize: '13px',
                fontWeight: '500',
                color: '#333',
              }}
            >
              {objective.text}
            </h4>
            {objective.isMandatory && (
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '3px',
                  fontSize: '10px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                }}
              >
                Required
              </span>
            )}
          </div>
        </div>
      </div>

      {objective.learningTarget && (
        <div
          style={{
            fontSize: '12px',
            color: '#666',
            marginLeft: editMode ? '42px' : '42px',
            marginBottom: '0.5rem',
            fontStyle: 'italic',
          }}
        >
          {objective.learningTarget}
        </div>
      )}

      {objective.description && (
        <div
          style={{
            fontSize: '12px',
            color: '#666',
            marginLeft: editMode ? '42px' : '42px',
            lineHeight: '1.4',
          }}
        >
          {objective.description}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 999,
        }}
        onClick={onClose}
      />

      {/* Side Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: '400px',
          backgroundColor: '#fff',
          boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.15)',
          overflowY: 'auto',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '0.25rem' }}>
              {standard.code}
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#333',
              }}
            >
              {standard.name}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            {onToggleMandatory && (
              <button
                onClick={() => setEditMode(!editMode)}
                style={{
                  padding: '6px 10px',
                  fontSize: '12px',
                  backgroundColor: editMode ? '#ef4444' : '#f0f0f0',
                  color: editMode ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                {editMode ? 'Done' : 'Edit'}
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#999',
                padding: 0,
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Description */}
        {standard.description && (
          <div
            style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e0e0e0',
              fontSize: '13px',
              color: '#666',
              lineHeight: '1.5',
            }}
          >
            {standard.description}
          </div>
        )}

        {/* Mastery Threshold Note */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e0e0e0',
            fontSize: '12px',
            color: '#666',
            backgroundColor: '#fafafa',
          }}
        >
          Students must complete all required objectives and pass {passPercentage}% overall to demonstrate this standard.
        </div>

        {/* Objectives */}
        <div style={{ padding: '1.5rem', flex: 1 }}>
          {standard.objectives.length === 0 ? (
            <div style={{ color: '#999', fontSize: '13px' }}>
              No objectives defined for this standard.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Required Objectives Section */}
              {mandatory.length > 0 && (
                <div>
                  <h3
                    style={{
                      margin: '0 0 1rem 0',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#333',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Required Objectives ({mandatory.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {mandatory.map(renderObjective)}
                  </div>
                </div>
              )}

              {/* Optional Objectives Section */}
              {optional.length > 0 && (
                <div>
                  {mandatory.length > 0 && (
                    <div
                      style={{
                        height: '1px',
                        backgroundColor: '#e0e0e0',
                        margin: '0.5rem 0 1rem 0',
                      }}
                    />
                  )}
                  <h3
                    style={{
                      margin: '0 0 1rem 0',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Optional Objectives ({optional.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {optional.map(renderObjective)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

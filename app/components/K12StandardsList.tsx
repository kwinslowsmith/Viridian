'use client';

import React, { useState, useMemo } from 'react';
import { Standard, MASTERY_LEVELS } from './K12StandardsInterface.types';

interface StandardsListProps {
  standards: Standard[];
  onSelectStandard?: (standard: Standard) => void;
  onDrill?: (standardId: string) => void;
  selectedDomain?: string;
  onDomainChange?: (domain: string) => void;
}

export function K12StandardsList({
  standards,
  onSelectStandard,
  onDrill,
  selectedDomain = 'all',
  onDomainChange,
}: StandardsListProps): JSX.Element {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Get unique domains
  const domains = useMemo(() => {
    const uniqueDomains = new Set(standards.map((s) => s.domain));
    return Array.from(uniqueDomains).sort();
  }, [standards]);

  // Filter standards by domain
  const filteredStandards = useMemo(() => {
    if (selectedDomain === 'all') {
      return standards;
    }
    return standards.filter((s) => s.domain === selectedDomain);
  }, [standards, selectedDomain]);

  const handleStandardClick = (standard: Standard) => {
    if (onSelectStandard) {
      onSelectStandard(standard);
    }
    if (onDrill) {
      onDrill(standard.id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
          Learning Standards
        </h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '1rem' }}>
          Browse and track mastery across {standards.length} standards
        </p>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
          Filter by domain:
        </label>
        <select
          value={selectedDomain}
          onChange={(e) => {
            if (onDomainChange) {
              onDomainChange(e.target.value);
            }
          }}
          style={{
            padding: '0.5rem 0.75rem',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#fff',
            cursor: 'pointer',
            color: '#333',
          }}
        >
          <option value="all">All Domains ({standards.length})</option>
          {domains.map((domain) => {
            const count = standards.filter((s) => s.domain === domain).length;
            const label = formatDomainName(domain);
            return (
              <option key={domain} value={domain}>
                {label} ({count})
              </option>
            );
          })}
        </select>
      </div>

      {/* Standards Table */}
      <div
        style={{
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
          backgroundColor: '#fff',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '13px',
                }}
              >
                Standard
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '13px',
                }}
              >
                Domain
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '13px',
                }}
              >
                Classes
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '13px',
                }}
              >
                Students
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '13px',
                }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStandards.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: '32px 16px',
                    textAlign: 'center',
                    color: '#999',
                  }}
                >
                  No standards found for this domain.
                </td>
              </tr>
            ) : (
              filteredStandards.map((standard) => (
                <tr
                  key={standard.id}
                  onMouseEnter={() => setHoveredRow(standard.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor:
                      hoveredRow === standard.id ? '#f9f9f9' : '#fff',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <td
                    style={{
                      padding: '12px 16px',
                      color: '#333',
                      fontWeight: '500',
                    }}
                  >
                    {standard.name}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#666' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        backgroundColor: '#e8f5e9',
                        color: '#2e7d32',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                      }}
                    >
                      {formatDomainName(standard.domain)}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      color: '#666',
                    }}
                  >
                    {standard.classCount}
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      color: '#666',
                    }}
                  >
                    {standard.studentCount}
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                    }}
                  >
                    <button
                      onClick={() => handleStandardClick(standard)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        backgroundColor: '#1e88e5',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor =
                          '#1565c0';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor =
                          '#1e88e5';
                      }}
                    >
                      View Classes
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: '1rem', fontSize: '13px', color: '#666' }}>
        <span>Showing {filteredStandards.length} of {standards.length} standards</span>
      </div>
    </div>
  );
}

function formatDomainName(domain: string): string {
  const names: Record<string, string> = {
    us_history: 'US History',
    ap_seminar: 'AP Seminar',
    english_lit: 'English Literature',
    world_history: 'World History',
  };
  return names[domain] || domain.replace(/_/g, ' ');
}

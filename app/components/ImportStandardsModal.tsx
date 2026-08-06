'use client';

import React, { useState, useEffect } from 'react';

interface StandardsBank {
  id: string;
  name: string;
  subject: string;
  source: string;
  description?: string;
  unitCount: number;
  standardCount: number;
  isImported: boolean;
}

interface ImportStandardsModalProps {
  isOpen: boolean;
  orgSlug?: string;
  onClose: () => void;
  onImportSuccess?: () => void;
}

export function ImportStandardsModal({
  isOpen,
  orgSlug,
  onClose,
  onImportSuccess,
}: ImportStandardsModalProps): React.JSX.Element | null {
  const [banks, setBanks] = useState<StandardsBank[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && orgSlug) {
      loadAvailableBanks();
    }
  }, [isOpen, orgSlug]);

  const loadAvailableBanks = async () => {
    if (!orgSlug) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/organizations/${orgSlug}/import-standards`
      );
      if (!response.ok) {
        throw new Error('Failed to load available standards banks');
      }
      const data = await response.json();
      setBanks(data.availableBanks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load banks');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (bankId: string) => {
    if (!orgSlug) return;
    setImporting(bankId);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(
        `/api/organizations/${orgSlug}/import-standards`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ standardsBankId: bankId }),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to import standards');
      }
      const data = await response.json();
      setSuccessMessage(data.message);

      // Refresh banks list
      await loadAvailableBanks();

      // Notify parent
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import standards');
    } finally {
      setImporting(null);
    }
  };

  if (!isOpen) return null;

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
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '700px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: '1rem', color: '#333', fontSize: '20px' }}>
          Import Learning Standards
        </h2>

        {error && (
          <div
            style={{
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '1rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              backgroundColor: '#e8f5e9',
              color: '#2e7d32',
              padding: '1rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: '14px',
            }}
          >
            ✓ {successMessage}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            Loading available standards...
          </div>
        ) : banks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
            No standards banks available.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {banks.map((bank) => (
              <div
                key={bank.id}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  padding: '1rem',
                  backgroundColor: bank.isImported ? '#f5f5f5' : '#fff',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    gap: '1rem',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        margin: 0,
                        marginBottom: '0.25rem',
                        color: '#333',
                        fontSize: '16px',
                        fontWeight: '600',
                      }}
                    >
                      {bank.name}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        marginBottom: '0.5rem',
                        color: '#666',
                        fontSize: '13px',
                      }}
                    >
                      {bank.description}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        gap: '1.5rem',
                        fontSize: '12px',
                        color: '#999',
                      }}
                    >
                      <span>{bank.unitCount} units</span>
                      <span>{bank.standardCount} standards</span>
                      <span>{bank.source}</span>
                    </div>
                  </div>

                  {bank.isImported ? (
                    <div
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#e8f5e9',
                        color: '#2e7d32',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ✓ Imported
                    </div>
                  ) : (
                    <button
                      onClick={() => handleImport(bank.id)}
                      disabled={importing === bank.id}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: importing === bank.id ? '#ccc' : '#1e88e5',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: importing === bank.id ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {importing === bank.id ? 'Importing...' : 'Import'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            marginTop: '2rem',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.5rem',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f0f0f0',
              color: '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

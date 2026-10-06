'use client';

/**
 * Admin Dashboard Component
 * System health monitoring, data cleanup, and bulk operations
 */

import { useState, useEffect } from 'react';
import {
  cleanupStaleMessages,
  cleanupEmptyDiscussions,
  checkDatabaseHealth,
  checkRealtimeHealth,
  generateSystemReport,
  exportCommunityData,
  downloadJSON,
  bulkArchiveDiscussions,
} from '@/lib/admin-utils';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'health' | 'cleanup' | 'export' | 'report'>('health');
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [rtHealth, setRtHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadHealthStatus();
    const interval = setInterval(loadHealthStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadHealthStatus = async () => {
    try {
      const [dbResult, rtResult] = await Promise.all([checkDatabaseHealth(), checkRealtimeHealth()]);
      setDbHealth(dbResult);
      setRtHealth(rtResult);
    } catch (error) {
      console.error('Failed to load health status:', error);
    }
  };

  const handleCleanup = async (type: 'stale-messages' | 'empty-discussions') => {
    setIsLoading(true);
    try {
      let result;
      if (type === 'stale-messages') {
        result = await cleanupStaleMessages('all', 30);
      } else {
        result = await cleanupEmptyDiscussions();
      }

      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({
          type: 'success',
          text: `Successfully cleaned up ${result.deleted} items`,
        });
      }
      loadHealthStatus();
    } catch (error) {
      setMessage({ type: 'error', text: 'Cleanup failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (communityId: string) => {
    setIsLoading(true);
    try {
      const result = await exportCommunityData(communityId);
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else if (result.data) {
        downloadJSON(result.data, `community-${communityId}-export.json`);
        setMessage({ type: 'success', text: 'Community data exported' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Export failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const report = await generateSystemReport();
      const blob = new Blob([report], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `t3-system-report-${Date.now()}.md`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'System report generated' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Report generation failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthColor = (healthy: boolean) => (healthy ? '#10b981' : '#ef4444');
  const getHealthText = (healthy: boolean) => (healthy ? '✅ Healthy' : '❌ Unhealthy');

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>🔧 Admin Dashboard</h1>
          <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>System health, cleanup, and operations</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '16px',
              backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: message.type === 'success' ? '#065f46' : '#991b1b',
              border: `1px solid ${message.type === 'success' ? '#6ee7b7' : '#fecaca'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Health Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* Database Health */}
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Database</h3>
              <span style={{ color: getHealthColor(dbHealth?.healthy || false) }}>
                {getHealthText(dbHealth?.healthy || false)}
              </span>
            </div>
            {dbHealth?.metrics && (
              <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>Communities: {dbHealth.metrics.totalCommunities}</div>
                <div>Discussions: {dbHealth.metrics.totalDiscussions}</div>
                <div>Messages: {dbHealth.metrics.totalMessages}</div>
                <div>Members: {dbHealth.metrics.totalMembers}</div>
              </div>
            )}
          </div>

          {/* Real-Time Health */}
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Real-Time</h3>
              <span style={{ color: getHealthColor(rtHealth?.healthy || false) }}>
                {getHealthText(rtHealth?.healthy || false)}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>
              {rtHealth?.subscriptions !== undefined && <div>Subscriptions: {rtHealth.subscriptions}</div>}
              {rtHealth?.error && <div style={{ color: '#ef4444' }}>Error: {rtHealth.error}</div>}
            </div>
          </div>

          {/* Quick Stats */}
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <h3 style={{ margin: 0, marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>Stats</h3>
            {dbHealth?.metrics && (
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                <div>
                  Avg Messages: {dbHealth.metrics.averageMessagesPerDiscussion}/discussion
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid #e5e7eb',
            marginBottom: '16px',
          }}
        >
          {(['health', 'cleanup', 'export', 'report'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #3b82f6' : 'none',
                color: activeTab === tab ? '#3b82f6' : '#6b7280',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? '600' : '400',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px' }}>
          {activeTab === 'health' && (
            <div>
              <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                System Health Status
              </h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '14px' }}>Database Connection</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {dbHealth?.healthy ? 'Connected and responding' : 'Connection issues detected'}
                  </div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '14px' }}>Real-Time Subscriptions</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {rtHealth?.healthy ? 'All subscriptions active' : 'Real-time service unavailable'}
                  </div>
                </div>
                <button
                  onClick={loadHealthStatus}
                  disabled={isLoading}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isLoading ? 'default' : 'pointer',
                    opacity: isLoading ? 0.6 : 1,
                  }}
                >
                  {isLoading ? 'Checking...' : 'Check Now'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'cleanup' && (
            <div>
              <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                Data Cleanup Operations
              </h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #fcd34d' }}>
                  <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '500', marginBottom: '8px' }}>
                    ⚠️ Warning: Cleanup operations cannot be undone. Ensure you have backups.
                  </div>
                </div>

                <div>
                  <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    Clean Stale Messages
                  </h3>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#6b7280' }}>
                    Remove messages older than 30 days
                  </p>
                  <button
                    onClick={() => handleCleanup('stale-messages')}
                    disabled={isLoading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: isLoading ? 'default' : 'pointer',
                      opacity: isLoading ? 0.6 : 1,
                    }}
                  >
                    {isLoading ? 'Cleaning...' : 'Start Cleanup'}
                  </button>
                </div>

                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    Remove Empty Discussions
                  </h3>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#6b7280' }}>
                    Delete discussions with no messages
                  </p>
                  <button
                    onClick={() => handleCleanup('empty-discussions')}
                    disabled={isLoading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: isLoading ? 'default' : 'pointer',
                      opacity: isLoading ? 0.6 : 1,
                    }}
                  >
                    {isLoading ? 'Deleting...' : 'Start Deletion'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div>
              <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                Data Export
              </h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px 0' }}>
                  Export community data in JSON format for backup or analysis
                </p>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                    Community ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter community ID"
                    id="community-id"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  onClick={() => {
                    const communityId = (document.getElementById('community-id') as HTMLInputElement)?.value;
                    if (communityId) {
                      handleExport(communityId);
                    }
                  }}
                  disabled={isLoading}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isLoading ? 'default' : 'pointer',
                    opacity: isLoading ? 0.6 : 1,
                  }}
                >
                  {isLoading ? 'Exporting...' : 'Export Data'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'report' && (
            <div>
              <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                System Report
              </h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px 0' }}>
                  Generate a comprehensive system report including health status, metrics, and recommendations
                </p>

                <button
                  onClick={handleGenerateReport}
                  disabled={isLoading}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isLoading ? 'default' : 'pointer',
                    opacity: isLoading ? 0.6 : 1,
                    alignSelf: 'start',
                  }}
                >
                  {isLoading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: '24px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px', fontSize: '12px', color: '#6b7280' }}>
          Last refreshed: {new Date().toLocaleTimeString()} | T3 Admin v1.0
        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * Analytics Dashboard Component
 * Real-time metrics tracking and visualization for T3 infrastructure
 * Tracks: message latency, cache hit rate, error rate, network health
 */

import { useState, useEffect, useRef } from 'react';

export interface MetricsSnapshot {
  timestamp: number;
  avgLatency: number;
  p95Latency: number;
  errorRate: number;
  cacheHitRate: number;
  requestCount: number;
  offlineQueueSize: number;
}

export interface AnalyticsConfig {
  windowSize?: number; // samples to keep (default: 100)
  updateInterval?: number; // ms between snapshots (default: 5000)
  enableStorage?: boolean; // persist to localStorage (default: false)
  storageKey?: string; // localStorage key (default: 't3-metrics')
}

const defaultConfig: Required<AnalyticsConfig> = {
  windowSize: 100,
  updateInterval: 5000,
  enableStorage: true,
  storageKey: 't3-metrics',
};

class MetricsCollector {
  private latencySamples: number[] = [];
  private errorCount = 0;
  private cacheHits = 0;
  private cacheMisses = 0;
  private requestCount = 0;
  private offlineQueueSize = 0;
  private lastReset = Date.now();

  recordLatency(ms: number) {
    this.latencySamples.push(ms);
    if (this.latencySamples.length > 1000) {
      this.latencySamples = this.latencySamples.slice(-1000);
    }
  }

  recordError() {
    this.errorCount++;
  }

  recordCacheHit() {
    this.cacheHits++;
  }

  recordCacheMiss() {
    this.cacheMisses++;
  }

  recordRequest() {
    this.requestCount++;
  }

  setOfflineQueueSize(size: number) {
    this.offlineQueueSize = size;
  }

  getSnapshot(): MetricsSnapshot {
    const avgLatency = this.latencySamples.length > 0
      ? this.latencySamples.reduce((a, b) => a + b, 0) / this.latencySamples.length
      : 0;

    const sorted = [...this.latencySamples].sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    const p95Latency = sorted[p95Index] || 0;

    const totalRequests = this.cacheHits + this.cacheMisses;
    const cacheHitRate = totalRequests > 0 ? (this.cacheHits / totalRequests) * 100 : 0;

    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;

    return {
      timestamp: Date.now(),
      avgLatency: Math.round(avgLatency),
      p95Latency: Math.round(p95Latency),
      errorRate: Math.round(errorRate * 100) / 100,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      requestCount: this.requestCount,
      offlineQueueSize: this.offlineQueueSize,
    };
  }

  reset() {
    this.latencySamples = [];
    this.errorCount = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.requestCount = 0;
    this.lastReset = Date.now();
  }
}

let globalCollector: MetricsCollector | null = null;

export function useAnalytics(config?: AnalyticsConfig) {
  const finalConfig = { ...defaultConfig, ...config };

  if (!globalCollector) {
    globalCollector = new MetricsCollector();
  }

  return {
    recordLatency: (ms: number) => globalCollector!.recordLatency(ms),
    recordError: () => globalCollector!.recordError(),
    recordCacheHit: () => globalCollector!.recordCacheHit(),
    recordCacheMiss: () => globalCollector!.recordCacheMiss(),
    recordRequest: () => globalCollector!.recordRequest(),
    setOfflineQueueSize: (size: number) => globalCollector!.setOfflineQueueSize(size),
    getSnapshot: () => globalCollector!.getSnapshot(),
    reset: () => globalCollector!.reset(),
  };
}

export function AnalyticsDashboard({ config }: { config?: AnalyticsConfig }) {
  const finalConfig = { ...defaultConfig, ...config };
  const [snapshots, setSnapshots] = useState<MetricsSnapshot[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const collectorRef = useRef<MetricsCollector>(globalCollector || new MetricsCollector());

  useEffect(() => {
    globalCollector = collectorRef.current;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const snapshot = collectorRef.current.getSnapshot();
      setSnapshots((prev) => {
        const updated = [...prev, snapshot];
        if (updated.length > finalConfig.windowSize) {
          updated.shift();
        }
        if (finalConfig.enableStorage) {
          localStorage.setItem(finalConfig.storageKey, JSON.stringify(updated));
        }
        return updated;
      });
    }, finalConfig.updateInterval);

    return () => clearInterval(interval);
  }, [finalConfig]);

  const latestSnapshot = snapshots[snapshots.length - 1];
  const avgLatency = latestSnapshot?.avgLatency || 0;
  const errorRate = latestSnapshot?.errorRate || 0;
  const cacheHitRate = latestSnapshot?.cacheHitRate || 0;

  const getStatusColor = (metric: 'latency' | 'error' | 'cache') => {
    if (metric === 'latency') {
      if (avgLatency < 200) return '#10b981';
      if (avgLatency < 500) return '#f59e0b';
      return '#ef4444';
    }
    if (metric === 'error') {
      if (errorRate < 1) return '#10b981';
      if (errorRate < 5) return '#f59e0b';
      return '#ef4444';
    }
    if (metric === 'cache') {
      if (cacheHitRate > 70) return '#10b981';
      if (cacheHitRate > 40) return '#f59e0b';
      return '#ef4444';
    }
    return '#6b7280';
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: isOpen ? 'auto' : '20px',
        left: isOpen ? '20px' : 'auto',
        zIndex: 9999,
      }}
    >
      {isOpen ? (
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            padding: '20px',
            maxWidth: '600px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>📊 Analytics Dashboard</h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              ✕
            </button>
          </div>

          {/* Metrics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            {/* Avg Latency */}
            <div
              style={{
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                borderLeft: `4px solid ${getStatusColor('latency')}`,
              }}
            >
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Avg Latency</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                {avgLatency}ms
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                P95: {latestSnapshot?.p95Latency || 0}ms
              </div>
            </div>

            {/* Error Rate */}
            <div
              style={{
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                borderLeft: `4px solid ${getStatusColor('error')}`,
              }}
            >
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Error Rate</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                {errorRate.toFixed(2)}%
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                {latestSnapshot?.requestCount || 0} requests
              </div>
            </div>

            {/* Cache Hit Rate */}
            <div
              style={{
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                borderLeft: `4px solid ${getStatusColor('cache')}`,
              }}
            >
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Cache Hit Rate</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                {cacheHitRate.toFixed(1)}%
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>Performance gain</div>
            </div>

            {/* Queue Size */}
            <div
              style={{
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                borderLeft: `4px solid ${latestSnapshot?.offlineQueueSize === 0 ? '#10b981' : '#f59e0b'}`,
              }}
            >
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Offline Queue</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                {latestSnapshot?.offlineQueueSize || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>Pending requests</div>
            </div>
          </div>

          {/* Latency Chart */}
          {snapshots.length > 1 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#6b7280' }}>
                Latency Trend (last {snapshots.length} samples)
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '2px',
                  height: '60px',
                  backgroundColor: '#f9fafb',
                  padding: '8px',
                  borderRadius: '4px',
                }}
              >
                {snapshots.map((snapshot, idx) => {
                  const maxLatency = Math.max(...snapshots.map((s) => s.avgLatency), 500);
                  const height = (snapshot.avgLatency / maxLatency) * 100;
                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        height: `${Math.max(height, 2)}%`,
                        backgroundColor: snapshot.avgLatency < 200 ? '#10b981' : snapshot.avgLatency < 500 ? '#f59e0b' : '#ef4444',
                        borderRadius: '2px',
                        opacity: 0.7 + (idx / snapshots.length) * 0.3,
                        transition: 'all 0.2s',
                      }}
                      title={`${snapshot.avgLatency}ms at ${new Date(snapshot.timestamp).toLocaleTimeString()}`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div
            style={{
              fontSize: '11px',
              color: '#9ca3af',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '12px',
              textAlign: 'center',
            }}
          >
            Last updated: {latestSnapshot ? new Date(latestSnapshot.timestamp).toLocaleTimeString() : 'N/A'}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
          }}
          title="Open Analytics Dashboard"
        >
          📊
        </button>
      )}
    </div>
  );
}

export function AnalyticsReport() {
  const [snapshots, setSnapshots] = useState<MetricsSnapshot[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('t3-metrics');
    if (stored) {
      try {
        setSnapshots(JSON.parse(stored));
      } catch (err) {
        console.error('Failed to parse stored metrics:', err);
      }
    }
  }, []);

  if (snapshots.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
        No metrics data available
      </div>
    );
  }

  const avgLatencies = snapshots.map((s) => s.avgLatency);
  const overallAvg = Math.round(avgLatencies.reduce((a, b) => a + b) / avgLatencies.length);
  const minLatency = Math.min(...avgLatencies);
  const maxLatency = Math.max(...avgLatencies);

  const errorRates = snapshots.map((s) => s.errorRate);
  const avgErrorRate = (errorRates.reduce((a, b) => a + b) / errorRates.length).toFixed(2);

  const cacheHitRates = snapshots.map((s) => s.cacheHitRate);
  const avgCacheHitRate = (cacheHitRates.reduce((a, b) => a + b) / cacheHitRates.length).toFixed(1);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginTop: 0 }}>📈 T3 Performance Report</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: '#166534', fontWeight: '600', marginBottom: '8px' }}>
            Average Latency
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#166534', marginBottom: '4px' }}>
            {overallAvg}ms
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Range: {minLatency}ms - {maxLatency}ms
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '600', marginBottom: '8px' }}>
            Average Error Rate
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#92400e', marginBottom: '4px' }}>
            {avgErrorRate}%
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Lower is better</div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600', marginBottom: '8px' }}>
            Average Cache Hit Rate
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e40af', marginBottom: '4px' }}>
            {avgCacheHitRate}%
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Requests served from cache</div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
        <h2 style={{ marginTop: 0, fontSize: '16px', fontWeight: 'bold' }}>Sample Details</h2>
        <div
          style={{
            overflowX: 'auto',
            fontSize: '12px',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600' }}>Time</th>
                <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600' }}>Avg Latency</th>
                <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600' }}>Error Rate</th>
                <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600' }}>Cache Hit %</th>
                <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600' }}>Requests</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.slice(-10).map((snapshot, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '8px' }}>
                    {new Date(snapshot.timestamp).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: '8px' }}>{snapshot.avgLatency}ms</td>
                  <td style={{ padding: '8px' }}>{snapshot.errorRate.toFixed(2)}%</td>
                  <td style={{ padding: '8px' }}>{snapshot.cacheHitRate.toFixed(1)}%</td>
                  <td style={{ padding: '8px' }}>{snapshot.requestCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

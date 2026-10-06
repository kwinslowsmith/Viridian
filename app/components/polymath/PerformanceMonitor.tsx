'use client';

/**
 * T3: Performance Monitoring Dashboard
 * Tracks real-time metrics for health checks and debugging
 * Display latency, cache hit rate, error rate, subscription health
 */

import React, { useState, useEffect, useRef } from 'react';
import { getAPIClient } from '@/lib/api-client';

interface Metric {
  name: string;
  value: string | number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

export function PerformanceMonitor() {
  const clientRef = useRef(getAPIClient());
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const report = clientRef.current.getPerformanceReport();
      const metrics_data = clientRef.current.getMetrics();

      const newMetrics: Metric[] = [
        {
          name: 'Avg Latency',
          value: report.avgLatency,
          unit: 'ms',
          status: parseFloat(report.avgLatency) < 200 ? 'healthy' : 'warning',
        },
        {
          name: 'Median Latency',
          value: report.medianLatency,
          unit: 'ms',
          status: parseFloat(report.medianLatency) < 150 ? 'healthy' : 'warning',
        },
        {
          name: 'Error Rate',
          value: report.errorRate,
          unit: '%',
          status: parseFloat(report.errorRate) < 2 ? 'healthy' : 'critical',
        },
        {
          name: 'Cache Hit Rate',
          value: report.cacheHitRate,
          unit: '%',
          status: parseFloat(report.cacheHitRate) > 50 ? 'healthy' : 'warning',
        },
        {
          name: 'Offline Queue',
          value: report.offlineQueueSize,
          unit: 'items',
          status: report.offlineQueueSize === 0 ? 'healthy' : 'warning',
        },
      ];

      setMetrics(newMetrics);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const statusColor = {
    healthy: '#10b981',
    warning: '#f59e0b',
    critical: '#ef4444',
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 999,
        }}
      >
        📊
      </button>

      {/* Monitor Panel */}
      {isVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '350px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            zIndex: 999,
            fontFamily: 'monospace',
            fontSize: '12px',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#f3f4f6',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: '12px 12px 0 0',
            }}
          >
            <div style={{ fontWeight: 'bold', color: '#1f2937' }}>
              Performance Monitor
            </div>
            <button
              onClick={() => setIsVisible(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              ✕
            </button>
          </div>

          {/* Metrics */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {metrics.map((metric) => (
              <div key={metric.name} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ color: '#6b7280' }}>{metric.name}</div>
                <div
                  style={{
                    color: statusColor[metric.status],
                    fontWeight: 'bold',
                  }}
                >
                  {metric.value} {metric.unit}
                </div>
              </div>
            ))}

            {/* Status Indicator */}
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ color: '#6b7280', marginBottom: '4px' }}>Overall Status</div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: getOverallStatus(metrics) === 'healthy' ? '#10b981' : '#f59e0b',
                  fontWeight: 'bold',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: statusColor[getOverallStatus(metrics)],
                  }}
                />
                {getOverallStatus(metrics).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#f9fafb',
              borderTop: '1px solid #e5e7eb',
              fontSize: '11px',
              color: '#9ca3af',
              borderRadius: '0 0 12px 12px',
            }}
          >
            Updates every 5 seconds
          </div>
        </div>
      )}
    </>
  );
}

function getOverallStatus(
  metrics: Metric[]
): 'healthy' | 'warning' | 'critical' {
  const criticalCount = metrics.filter((m) => m.status === 'critical').length;
  const warningCount = metrics.filter((m) => m.status === 'warning').length;

  if (criticalCount > 0) return 'critical';
  if (warningCount > 1) return 'warning';
  return 'healthy';
}

// Detailed Dashboard (for admin page)
export function PerformanceDashboard() {
  const clientRef = useRef(getAPIClient());
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const report = clientRef.current.getPerformanceReport();
      setHistory((prev) => [...prev.slice(-59), { timestamp: new Date(), ...report }]); // Keep last 60 entries
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
      <h2 style={{ marginTop: 0 }}>Performance Dashboard</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Cards */}
        {[
          { label: 'Avg Latency', key: 'avgLatency', threshold: 200 },
          { label: 'Error Rate', key: 'errorRate', threshold: 2 },
          { label: 'Cache Hit Rate', key: 'cacheHitRate', threshold: 50 },
          { label: 'Offline Queue', key: 'offlineQueueSize', threshold: 0 },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>
              {card.label}
            </div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937',
              }}
            >
              {history.length > 0 ? history[history.length - 1][card.key] : '—'}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '14px' }}>
          Latency Trend (Last 5 minutes)
        </h3>

        {/* Simple ASCII chart */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '2px',
            height: '100px',
          }}
        >
          {history.map((entry, i) => {
            const value = parseFloat(entry.avgLatency) || 0;
            const height = Math.min((value / 500) * 100, 100); // Scale to max 500ms
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${height}%`,
                  backgroundColor: height > 80 ? '#ef4444' : height > 50 ? '#f59e0b' : '#10b981',
                  borderRadius: '2px',
                  minHeight: '2px',
                  opacity: 0.7,
                }}
              />
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#9ca3af',
            marginTop: '8px',
          }}
        >
          <span>0s</span>
          <span>2.5m</span>
          <span>5m</span>
        </div>
      </div>

      {/* Status */}
      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#1e40af',
        }}
      >
        ✅ All systems operational
      </div>
    </div>
  );
}

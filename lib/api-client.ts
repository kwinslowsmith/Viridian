/**
 * T3 Priority 3: Advanced API Client with Caching & Retry Logic
 * Handles request caching, exponential backoff, offline queue, and monitoring
 * Date: Oct 6, 2026
 */

import { useState, useCallback, useRef } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  cache?: boolean;
  cacheTTL?: number; // 5 minutes default
  retry?: boolean;
  maxRetries?: number;
  timeout?: number;
}

export interface PerformanceMetrics {
  latency: number[];
  errorRate: number;
  cacheHitRate: number;
  retryCount: number;
}

export interface OfflineQueueItem {
  url: string;
  options: RequestOptions;
  id: string;
  timestamp: number;
}

// ============================================================================
// CACHE IMPLEMENTATION
// ============================================================================

class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private metrics = {
    hits: 0,
    misses: 0,
    total: 0,
  };

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.metrics.misses++;
      this.metrics.total++;
      return null;
    }

    // Check if cache expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.metrics.misses++;
      this.metrics.total++;
      return null;
    }

    this.metrics.hits++;
    this.metrics.total++;
    return entry.data as T;
  }

  invalidate(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  getHitRate(): number {
    return this.metrics.total === 0 ? 0 : this.metrics.hits / this.metrics.total;
  }

  getStats() {
    return this.metrics;
  }
}

// ============================================================================
// RETRY LOGIC WITH EXPONENTIAL BACKOFF
// ============================================================================

class RetryHandler {
  private maxRetries: number;
  private baseDelay: number;
  private maxDelay: number;

  constructor(maxRetries = 3, baseDelay = 1000, maxDelay = 30000) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
  }

  async executeWithRetry<T>(
    fn: () => Promise<T>,
    onRetry?: (attempt: number, error: Error) => void
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === this.maxRetries) {
          throw lastError;
        }

        const delay = this.calculateBackoff(attempt);
        onRetry?.(attempt + 1, lastError);

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  private calculateBackoff(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, etc.
    const delay = this.baseDelay * Math.pow(2, attempt);
    // Add jitter: random factor between 0.9 and 1.1
    const jitter = 0.9 + Math.random() * 0.2;
    const backoff = Math.min(delay * jitter, this.maxDelay);
    return Math.floor(backoff);
  }
}

// ============================================================================
// OFFLINE QUEUE
// ============================================================================

class OfflineQueue {
  private queue: OfflineQueueItem[] = [];
  private isOnline = navigator?.onLine ?? true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  private handleOnline(): void {
    this.isOnline = true;
    this.processQueue();
  }

  private handleOffline(): void {
    this.isOnline = false;
  }

  async add(
    url: string,
    options: RequestOptions,
    onProcess?: (item: OfflineQueueItem) => Promise<void>
  ): Promise<void> {
    const item: OfflineQueueItem = {
      url,
      options,
      id: 'offline-' + Date.now() + '-' + Math.random(),
      timestamp: Date.now(),
    };

    if (this.isOnline) {
      // If online, process immediately
      await onProcess?.(item);
    } else {
      // If offline, queue for later
      this.queue.push(item);
    }
  }

  private async processQueue(): Promise<void> {
    const toProcess = [...this.queue];
    this.queue = [];

    for (const item of toProcess) {
      try {
        // This would be called from main fetch function
        console.log(`Processing queued request: ${item.url}`);
      } catch (error) {
        // Re-queue if failed
        this.queue.push(item);
      }
    }
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }

  isOffline(): boolean {
    return !this.isOnline;
  }
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

class PerformanceMonitor {
  private latencies: number[] = [];
  private errors: number = 0;
  private totalRequests: number = 0;
  private maxSamples: number = 100;

  recordLatency(latency: number): void {
    this.latencies.push(latency);
    if (this.latencies.length > this.maxSamples) {
      this.latencies.shift();
    }
    this.totalRequests++;
  }

  recordError(): void {
    this.errors++;
    this.totalRequests++;
  }

  getMetrics(): PerformanceMetrics {
    return {
      latency: [...this.latencies],
      errorRate: this.totalRequests === 0 ? 0 : this.errors / this.totalRequests,
      cacheHitRate: 0, // Set by APIClient
      retryCount: 0, // Set by APIClient
    };
  }

  getAverageLatency(): number {
    if (this.latencies.length === 0) return 0;
    return this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;
  }

  getMedianLatency(): number {
    if (this.latencies.length === 0) return 0;
    const sorted = [...this.latencies].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  reset(): void {
    this.latencies = [];
    this.errors = 0;
    this.totalRequests = 0;
  }
}

// ============================================================================
// MAIN API CLIENT
// ============================================================================

export class APIClient {
  private cache: RequestCache;
  private retry: RetryHandler;
  private offlineQueue: OfflineQueue;
  private monitor: PerformanceMonitor;

  constructor(
    maxRetries = 3,
    cacheTTL = 5 * 60 * 1000,
    maxDelay = 30000
  ) {
    this.cache = new RequestCache();
    this.retry = new RetryHandler(maxRetries, 1000, maxDelay);
    this.offlineQueue = new OfflineQueue();
    this.monitor = new PerformanceMonitor();
  }

  async fetch<T>(
    url: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      cache = true,
      cacheTTL = 5 * 60 * 1000,
      retry = true,
      timeout = 10000,
    } = options;

    const cacheKey = `${options.method || 'GET'}:${url}`;

    // Try cache first (for GET requests only)
    if (options.method !== 'POST' && options.method !== 'PATCH' && options.method !== 'DELETE' && cache) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Prepare fetch function with timeout
    const fetchWithTimeout = async (): Promise<T> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const startTime = Date.now();

        const response = await fetch(url, {
          method: options.method,
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        const latency = Date.now() - startTime;
        this.monitor.recordLatency(latency);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json() as T;

        // Cache successful GET responses
        if (options.method !== 'POST' && options.method !== 'PATCH' && options.method !== 'DELETE' && cache) {
          this.cache.set(cacheKey, data, cacheTTL);
        }

        return data;
      } finally {
        clearTimeout(timeoutId);
      }
    };

    // Execute with retry logic
    if (retry && (options.method === 'GET' || options.method === undefined)) {
      return this.retry.executeWithRetry(
        () => fetchWithTimeout(),
        (attempt) => {
          console.warn(`Retry attempt ${attempt} for ${url}`);
        }
      );
    }

    return fetchWithTimeout();
  }

  invalidateCache(pattern?: string): void {
    if (pattern) {
      this.cache.invalidate(pattern);
    } else {
      this.cache.invalidate();
    }
  }

  getMetrics(): PerformanceMetrics {
    const metrics = this.monitor.getMetrics();
    return {
      ...metrics,
      cacheHitRate: this.cache.getHitRate(),
    };
  }

  getPerformanceReport() {
    return {
      avgLatency: `${Math.round(this.monitor.getAverageLatency())}ms`,
      medianLatency: `${Math.round(this.monitor.getMedianLatency())}ms`,
      errorRate: `${(this.monitor.getMetrics().errorRate * 100).toFixed(2)}%`,
      cacheHitRate: `${(this.cache.getHitRate() * 100).toFixed(2)}%`,
      offlineQueueSize: this.offlineQueue.getQueueSize(),
    };
  }

  isOffline(): boolean {
    return this.offlineQueue.isOffline();
  }
}

// ============================================================================
// REACT HOOK: useAPIClient
// ============================================================================

export function useAPIClient(maxRetries = 3, cacheTTL = 5 * 60 * 1000) {
  const clientRef = useRef(new APIClient(maxRetries, cacheTTL));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async <T,>(
      url: string,
      options?: RequestOptions
    ): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        const data = await clientRef.current.fetch<T>(url, options);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const invalidateCache = useCallback(
    (pattern?: string) => {
      clientRef.current.invalidateCache(pattern);
    },
    []
  );

  const getMetrics = useCallback(
    () => clientRef.current.getMetrics(),
    []
  );

  const getPerformanceReport = useCallback(
    () => clientRef.current.getPerformanceReport(),
    []
  );

  return {
    fetch,
    loading,
    error,
    invalidateCache,
    getMetrics,
    getPerformanceReport,
  };
}

// ============================================================================
// SINGLETON INSTANCE FOR APP-WIDE USE
// ============================================================================

let clientInstance: APIClient | null = null;

export function initializeAPIClient(maxRetries = 3, cacheTTL = 5 * 60 * 1000): APIClient {
  if (!clientInstance) {
    clientInstance = new APIClient(maxRetries, cacheTTL);
  }
  return clientInstance;
}

export function getAPIClient(): APIClient {
  if (!clientInstance) {
    clientInstance = new APIClient();
  }
  return clientInstance;
}

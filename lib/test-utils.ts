/**
 * Testing Utilities for T3
 * Test data generation, seeding, and assertion helpers
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// TEST DATA GENERATORS
// ============================================================================

export function generateTestId(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function generateTestUser() {
  const id = generateTestId('user');
  return {
    id,
    email: `${id}@test.local`,
    name: `Test User ${id}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
  };
}

export function generateTestCommunity(overrides?: Partial<any>) {
  const id = generateTestId('community');
  return {
    id,
    name: `Test Community ${id}`,
    slug: `test-community-${Date.now()}`,
    description: 'A test community for E2E testing',
    private: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function generateTestDiscussion(communityId: string, overrides?: Partial<any>) {
  const id = generateTestId('discussion');
  return {
    id,
    communityId,
    title: `Test Discussion ${id}`,
    description: 'A test discussion for E2E testing',
    private: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function generateTestMessage(
  discussionId: string,
  userId: string,
  overrides?: Partial<any>
) {
  const id = generateTestId('message');
  return {
    id,
    discussionId,
    userId,
    content: `Test message ${id}: Lorem ipsum dolor sit amet.`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ============================================================================
// TEST FIXTURES
// ============================================================================

export class TestFixture {
  private user: any;
  private community: any;
  private discussions: Map<string, any> = new Map();
  private messages: Map<string, any> = new Map();

  async setup() {
    this.user = generateTestUser();
    this.community = generateTestCommunity();

    return this;
  }

  async createCommunity(overrides?: Partial<any>) {
    const community = generateTestCommunity(overrides);
    const { error } = await supabase.from('Community').insert(community);

    if (error) throw error;

    this.community = community;
    return community;
  }

  async createDiscussion(overrides?: Partial<any>) {
    const discussion = generateTestDiscussion(this.community.id, overrides);
    const { error } = await supabase.from('Discussion').insert(discussion);

    if (error) throw error;

    this.discussions.set(discussion.id, discussion);
    return discussion;
  }

  async createMessage(discussionId: string, overrides?: Partial<any>) {
    const message = generateTestMessage(discussionId, this.user.id, overrides);
    const { error } = await supabase.from('DiscussionMessage').insert(message);

    if (error) throw error;

    this.messages.set(message.id, message);
    return message;
  }

  async createMultipleMessages(discussionId: string, count: number) {
    const messages = [];
    for (let i = 0; i < count; i++) {
      const msg = generateTestMessage(discussionId, this.user.id, {
        content: `Test message ${i + 1}/${count}`,
      });
      const { error } = await supabase.from('DiscussionMessage').insert(msg);

      if (!error) {
        messages.push(msg);
        this.messages.set(msg.id, msg);
      }
    }
    return messages;
  }

  async cleanup() {
    const ids = Array.from(this.messages.keys());
    if (ids.length > 0) {
      await supabase.from('DiscussionMessage').delete().in('id', ids);
    }

    const discussionIds = Array.from(this.discussions.keys());
    if (discussionIds.length > 0) {
      await supabase.from('Discussion').delete().in('id', discussionIds);
    }

    if (this.community?.id) {
      await supabase.from('Community').delete().eq('id', this.community.id);
    }
  }

  getUser() {
    return this.user;
  }

  getCommunity() {
    return this.community;
  }

  getDiscussion(id: string) {
    return this.discussions.get(id);
  }

  getMessage(id: string) {
    return this.messages.get(id);
  }
}

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

export class TestAssertions {
  static assertExists<T>(value: T | null | undefined, message?: string): asserts value is T {
    if (value === null || value === undefined) {
      throw new Error(message || 'Expected value to exist');
    }
  }

  static assertEqual<T>(actual: T, expected: T, message?: string) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  static assertContains(str: string, substr: string, message?: string) {
    if (!str.includes(substr)) {
      throw new Error(message || `Expected string to contain "${substr}"`);
    }
  }

  static assertGreaterThan(actual: number, threshold: number, message?: string) {
    if (actual <= threshold) {
      throw new Error(message || `Expected ${actual} > ${threshold}`);
    }
  }

  static assertLessThan(actual: number, threshold: number, message?: string) {
    if (actual >= threshold) {
      throw new Error(message || `Expected ${actual} < ${threshold}`);
    }
  }

  static assertArrayLength(arr: any[], length: number, message?: string) {
    if (arr.length !== length) {
      throw new Error(message || `Expected array length ${length}, got ${arr.length}`);
    }
  }

  static async assertEventually<T>(
    condition: () => Promise<T> | T,
    timeout: number = 5000,
    message?: string
  ): Promise<T> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    while (Date.now() - startTime < timeout) {
      try {
        return await condition();
      } catch (error) {
        lastError = error as Error;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    throw new Error(message || `Assertion timeout after ${timeout}ms: ${lastError?.message}`);
  }
}

// ============================================================================
// PERFORMANCE TESTING
// ============================================================================

export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number[]> = new Map();

  start(label: string) {
    this.marks.set(label, Date.now());
  }

  end(label: string): number {
    const start = this.marks.get(label);
    if (start === undefined) {
      throw new Error(`No start mark for "${label}"`);
    }

    const duration = Date.now() - start;

    if (!this.measures.has(label)) {
      this.measures.set(label, []);
    }

    this.measures.get(label)!.push(duration);
    this.marks.delete(label);

    return duration;
  }

  getStats(label: string) {
    const times = this.measures.get(label);
    if (!times || times.length === 0) {
      return null;
    }

    const sorted = [...times].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const avg = sum / sorted.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    return {
      count: times.length,
      avg: Math.round(avg),
      median: Math.round(median),
      min,
      max,
      p95: Math.round(p95),
      p99: Math.round(p99),
    };
  }

  report() {
    const labels = Array.from(this.measures.keys());
    const report: Record<string, any> = {};

    labels.forEach((label) => {
      report[label] = this.getStats(label);
    });

    return report;
  }
}

// ============================================================================
// API TESTING HELPERS
// ============================================================================

export async function testAPIEndpoint(
  method: string,
  path: string,
  options?: {
    body?: any;
    headers?: Record<string, string>;
    auth?: string;
  }
): Promise<{
  status: number;
  data: any;
  error?: any;
  duration: number;
}> {
  const start = Date.now();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (options?.auth) {
    headers['Authorization'] = `Bearer ${options.auth}`;
  }

  try {
    const response = await fetch(`http://localhost:3000${path}`, {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await response.json().catch(() => null);
    const duration = Date.now() - start;

    return {
      status: response.status,
      data,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - start;

    return {
      status: 0,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
    };
  }
}

// ============================================================================
// MOCK DATA
// ============================================================================

export const MOCK_DISCUSSIONS = [
  {
    title: 'Getting Started with React',
    description: 'Learn React fundamentals',
  },
  {
    title: 'Advanced TypeScript Patterns',
    description: 'Deep dive into TypeScript',
  },
  {
    title: 'Production Deployment Guide',
    description: 'How to deploy to production',
  },
  {
    title: 'Performance Optimization Tips',
    description: 'Make your app faster',
  },
  {
    title: 'Security Best Practices',
    description: 'Secure your application',
  },
];

export const MOCK_MESSAGES = [
  'Great discussion! Thanks for sharing.',
  'I completely agree with this approach.',
  'Can you elaborate on that point?',
  'Interesting perspective, never thought of it that way.',
  'This is very helpful, thanks!',
  'Does anyone have experience with this?',
  'I found this resource helpful: [link]',
  'Following this discussion with interest.',
  'Has anyone tried this in production?',
  'Great question! Let me think about this.',
];

// ============================================================================
// SEED DATABASE
// ============================================================================

export async function seedTestDatabase() {
  const fixture = new TestFixture();
  await fixture.setup();

  const community = await fixture.createCommunity();
  console.log('✓ Created test community:', community.id);

  const discussions = [];
  for (const mockDiscussion of MOCK_DISCUSSIONS) {
    const discussion = await fixture.createDiscussion(mockDiscussion);
    discussions.push(discussion);
    console.log('✓ Created discussion:', discussion.id);

    // Add messages to each discussion
    const messageCount = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < messageCount; i++) {
      const message = await fixture.createMessage(discussion.id, {
        content: MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)],
      });
    }
  }

  console.log('\n✅ Test database seeded successfully!');
  console.log(`- 1 community: ${community.id}`);
  console.log(`- ${discussions.length} discussions`);
  console.log(`- ~${discussions.length * 4} messages`);

  return { community, discussions };
}

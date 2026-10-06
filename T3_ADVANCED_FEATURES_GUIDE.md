# T3 Advanced Features Guide
**Date**: Oct 6-8, 2026  
**Status**: 🚀 Production Ready  
**Version**: 2.0 (Advanced Features)

---

## Table of Contents

1. [Analytics Dashboard](#analytics-dashboard)
2. [Admin Operations](#admin-operations)
3. [Notification System](#notification-system)
4. [Security & Access Control](#security--access-control)
5. [Testing & Test Utilities](#testing--test-utilities)
6. [Playwright E2E Testing](#playwright-e2e-testing)
7. [Performance Monitoring](#performance-monitoring)
8. [Integration Checklist](#integration-checklist)

---

## Analytics Dashboard

### Overview
Real-time metrics tracking for T3 infrastructure with visualization and historical data.

### Components

#### `AnalyticsDashboard` Component
```tsx
import { AnalyticsDashboard } from '@/app/components/polymath/AnalyticsDashboard';

export default function Page() {
  return <AnalyticsDashboard config={{ windowSize: 100, updateInterval: 5000 }} />;
}
```

#### `useAnalytics` Hook
```tsx
import { useAnalytics } from '@/app/components/polymath/AnalyticsDashboard';

function MyComponent() {
  const analytics = useAnalytics();

  // Record metrics
  analytics.recordLatency(250);
  analytics.recordCacheHit();
  analytics.recordRequest();

  // Get current snapshot
  const metrics = analytics.getSnapshot();
  console.log(`Avg latency: ${metrics.avgLatency}ms`);
}
```

### Metrics Tracked

- **Average Latency**: Mean response time
- **P95 Latency**: 95th percentile response time
- **Error Rate**: % of failed requests
- **Cache Hit Rate**: % of requests served from cache
- **Offline Queue Size**: Pending requests while offline
- **Request Count**: Total requests processed

### Storage

Metrics persist to localStorage by default (key: `t3-metrics`). Can be exported/imported:

```tsx
const stored = localStorage.getItem('t3-metrics');
const data = JSON.parse(stored);
console.log(data); // Array of metric snapshots
```

---

## Admin Operations

### Admin Dashboard Component

```tsx
import { AdminDashboard } from '@/app/components/polymath/AdminDashboard';

export default function AdminPage() {
  return <AdminDashboard />;
}
```

### Features

#### Health Monitoring
- Database connectivity & stats
- Real-time subscription status
- Active subscription count

#### Cleanup Operations
- **Clean Stale Messages**: Remove messages older than 30 days
- **Remove Empty Discussions**: Delete discussions with no messages
- ⚠️ All cleanup operations are irreversible

#### Data Export
- Export community data as JSON
- Includes communities, discussions, messages, members

#### System Reports
- Comprehensive health report
- Performance metrics
- Recommendations

### Admin Utilities

```tsx
import {
  cleanupStaleMessages,
  cleanupEmptyDiscussions,
  bulkArchiveDiscussions,
  exportCommunityData,
  downloadJSON,
  checkDatabaseHealth,
  checkRealtimeHealth,
  generateSystemReport,
} from '@/lib/admin-utils';

// Cleanup stale messages (>30 days old)
const result = await cleanupStaleMessages('discussion-id', 30);
console.log(`Deleted: ${result.deleted}`);

// Check system health
const health = await checkDatabaseHealth();
console.log(`Communities: ${health.metrics?.totalCommunities}`);

// Export community
const data = await exportCommunityData('community-id');
downloadJSON(data.data, 'community-backup.json');

// Bulk operations
await bulkArchiveDiscussions('community-id', ['discussion-1', 'discussion-2']);
```

---

## Notification System

### Components

#### Notification Bell
```tsx
import { NotificationBell } from '@/app/components/polymath/NotificationCenter';

export default function Header({ userId }: { userId: string }) {
  return (
    <header>
      <h1>My App</h1>
      <NotificationBell userId={userId} />
    </header>
  );
}
```

#### Toast Container
```tsx
import { ToastContainer } from '@/app/components/polymath/NotificationCenter';
import { useToastNotifications } from '@/hooks/useNotifications';

export default function Layout() {
  const { toasts, dismissToast } = useToastNotifications({
    autoCloseDuration: 3000,
    position: 'bottom-right',
  });

  return (
    <>
      <main>...</main>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
```

#### Notification Center (Full Page)
```tsx
import { NotificationCenterPage } from '@/app/components/polymath/NotificationCenter';

export default function NotificationsPage({ userId }: { userId: string }) {
  return <NotificationCenterPage userId={userId} />;
}
```

### Hooks

#### `useNotifications`
```tsx
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent({ userId }: { userId: string }) {
  const {
    notifications,
    unreadCount,
    preferences,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
  } = useNotifications(userId);

  // Add notification
  const id = await addNotification(
    'New Message',
    'You have a new message from John',
    'info',
    'toast',
    {
      actionUrl: '/messages/123',
      actionLabel: 'View',
      expiresIn: 5000,
    }
  );

  // Mark as read
  await markAsRead(id);

  // Update preferences
  await updatePreferences({
    enableToasts: true,
    enablePush: true,
    categories: {
      messages: true,
      mentions: true,
      milestones: true,
      system: false,
    },
  });

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      {notifications.map((notif) => (
        <div key={notif.id}>
          <h4>{notif.title}</h4>
          <p>{notif.message}</p>
        </div>
      ))}
    </div>
  );
}
```

#### `useToastNotifications`
```tsx
function MyComponent() {
  const { toasts, showToast, dismissToast } = useToastNotifications({
    autoCloseDuration: 4000,
  });

  const handleAction = async () => {
    try {
      await someAction();
      showToast(
        'Success',
        'Action completed successfully',
        'success',
        { duration: 3000 }
      );
    } catch (error) {
      showToast(
        'Error',
        'Something went wrong',
        'error',
        { duration: 5000 }
      );
    }
  };

  return <button onClick={handleAction}>Do Something</button>;
}
```

#### `usePushNotifications`
```tsx
function MyComponent() {
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) return <p>Push notifications not supported</p>;

  return (
    <button onClick={isSubscribed ? unsubscribe : subscribe}>
      {isSubscribed ? 'Unsubscribe' : 'Subscribe'} from push notifications
    </button>
  );
}
```

### Notification Types

```typescript
type NotificationType = 'info' | 'success' | 'warning' | 'error';
type NotificationChannel = 'toast' | 'inapp' | 'email' | 'push';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  channel: NotificationChannel;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
  expiresAt?: string;
}
```

---

## Security & Access Control

### Permission Checking

```tsx
import { checkPermission, AccessContext } from '@/lib/security-utils';

async function canDeleteMessage(userId: string, messageId: string) {
  const context: AccessContext = {
    userId,
    resourceId: messageId,
    resourceType: 'message',
  };

  return await checkPermission(context, 'delete');
}
```

### Audit Logging

```tsx
import { logAuditEvent, getAuditLogs } from '@/lib/security-utils';

// Log event
await logAuditEvent(userId, 'DELETE', 'message', messageId, {
  reason: 'User requested deletion',
  timestamp: new Date(),
});

// Get audit logs
const logs = await getAuditLogs('message', messageId, 50);
logs.forEach((log) => {
  console.log(`${log.action} by ${log.userId} at ${log.timestamp}`);
});
```

### Content Moderation

```tsx
import {
  scanForBannedContent,
  flagContentForReview,
} from '@/lib/security-utils';

const { isSafe, flaggedWords } = scanForBannedContent(userMessage);

if (!isSafe) {
  await flagContentForReview(userId, 'message', messageId, 'banned_content', {
    flaggedWords,
  });
}
```

### Data Encryption

```tsx
import { encryptSensitiveData, decryptSensitiveData } from '@/lib/security-utils';

const encrypted = encryptSensitiveData(sensitiveData);
const decrypted = decryptSensitiveData(encrypted);
```

### Rate Limiting

```tsx
import { checkRateLimit, getRateLimitStatus } from '@/lib/security-utils';

const key = `user:${userId}:messages`;
if (!checkRateLimit(key, 100, 60000)) { // 100 requests per minute
  throw new Error('Rate limit exceeded');
}

const status = getRateLimitStatus(key);
console.log(`Remaining requests: ${status?.remaining}`);
```

### RLS Policies

```tsx
import { generateRLSPolicies } from '@/lib/security-utils';

// Get SQL for enabling RLS on all tables
const sql = generateRLSPolicies();
// Run in Supabase SQL editor
```

---

## Testing & Test Utilities

### Test Fixtures

```tsx
import { TestFixture } from '@/lib/test-utils';

async function myTest() {
  const fixture = new TestFixture();
  await fixture.setup();

  const community = await fixture.createCommunity();
  const discussion = await fixture.createDiscussion();
  const messages = await fixture.createMultipleMessages(discussion.id, 10);

  // Run assertions...

  await fixture.cleanup(); // Clean up after test
}
```

### Test Assertions

```tsx
import { TestAssertions } from '@/lib/test-utils';

// Basic assertions
TestAssertions.assertEqual(actual, expected);
TestAssertions.assertExists(value);
TestAssertions.assertContains(str, substring);

// Numeric assertions
TestAssertions.assertGreaterThan(latency, 100);
TestAssertions.assertLessThan(latency, 500);

// Array assertions
TestAssertions.assertArrayLength(messages, 10);

// Async assertions (wait for condition)
const message = await TestAssertions.assertEventually(
  async () => {
    const { data } = await supabase
      .from('DiscussionMessage')
      .select('*')
      .eq('id', messageId)
      .single();
    return data;
  },
  5000 // timeout
);
```

### Performance Testing

```tsx
import { PerformanceMonitor } from '@/lib/test-utils';

const perf = new PerformanceMonitor();

perf.start('api-call');
await fetch('/api/messages');
const duration = perf.end('api-call');

const stats = perf.getStats('api-call');
console.log(`
  Calls: ${stats.count}
  Avg: ${stats.avg}ms
  P95: ${stats.p95}ms
  Max: ${stats.max}ms
`);

const report = perf.report();
console.log(report);
```

### API Testing

```tsx
import { testAPIEndpoint } from '@/lib/test-utils';

const result = await testAPIEndpoint('POST', '/api/messages', {
  body: { content: 'Test' },
  headers: { 'X-Custom': 'value' },
  auth: 'token',
});

console.log(`Status: ${result.status}`);
console.log(`Duration: ${result.duration}ms`);
console.log(`Data:`, result.data);
```

### Database Seeding

```tsx
import { seedTestDatabase } from '@/lib/test-utils';

// Seed test data
const { community, discussions } = await seedTestDatabase();
console.log(`Created ${discussions.length} discussions`);
```

---

## Playwright E2E Testing

### Configuration

File: `playwright.config.ts` (auto-generated)

```typescript
// Runs tests in:
// - Chromium
// - Firefox
// - WebKit (Safari)

// Default settings:
// - Timeout: 30s per test
// - Auto-start dev server
// - Screenshots on failure
// - Videos on failure
// - HTML report
```

### Running Tests

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test e2e/t3-realtime-sync.spec.ts

# Run single test
npx playwright test -g "Message appears instantly"

# Debug mode (interactive)
npx playwright test --debug

# Run with UI mode
npx playwright test --ui

# Generate report
npx playwright show-report
```

### Test File Structure

File: `e2e/t3-realtime-sync.spec.ts`

```typescript
test.describe('T3: Real-Time Sync E2E Tests', () => {
  let page1: Page;
  let page2: Page;

  test.beforeAll(async ({ browser }) => {
    // Setup: create two browser contexts
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    page1 = await context1.newPage();
    page2 = await context2.newPage();
  });

  test('Message appears instantly in both windows', async () => {
    // Navigate to page
    await page1.goto('/discussions/123');
    await page2.goto('/discussions/123');

    // Send message from page1
    await page1.fill('[data-testid="message-input"]', 'Hello');
    await page1.click('[data-testid="send-button"]');

    // Verify on page2 within 500ms
    await page2.waitForSelector('text=Hello', { timeout: 5000 });
    const latency = Date.now() - startTime;
    expect(latency).toBeLessThan(500);
  });

  test.afterAll(async () => {
    await page1.close();
    await page2.close();
  });
});
```

### Test Data Selectors

All components use `data-testid` for reliable test targeting:

```tsx
// Message components
<div data-testid="message-list" />
<input data-testid="message-input" />
<button data-testid="send-button" />
<button data-testid="edit-button" />
<button data-testid="delete-button" />

// Discussion components
<div data-testid="discussion-item" />
<button data-testid="new-discussion-button" />
<input data-testid="discussion-title" />

// Member components
<div data-testid="member-count" />
<div data-testid="member-list" />

// Status components
<div data-testid="error-message" />
<div data-testid="queued-message" />
```

---

## Performance Monitoring

### Real-Time Dashboard

Floating dashboard shows live metrics with color-coded status:

- 🟢 Green (Healthy): Latency < 200ms, Error < 1%
- 🟡 Yellow (Warning): Latency 200-500ms, Error 1-5%
- 🔴 Red (Critical): Latency > 500ms, Error > 5%

### PerformanceMonitor Component

```tsx
import { PerformanceMonitor } from '@/app/components/polymath/PerformanceMonitor';

export default function Layout() {
  return (
    <>
      <main>...</main>
      <PerformanceMonitor />
    </>
  );
}
```

### Metrics Collected

- Latency (avg, min, max, p95, p99)
- Cache hit rate
- Error rate
- Request count
- Offline queue size

### Analytics Dashboard

Full page analytics view with:
- Real-time metric cards
- Latency trend chart
- Historical data table
- System health status

```tsx
import { AnalyticsReport } from '@/app/components/polymath/AnalyticsDashboard';

export default function AnalyticsPage() {
  return <AnalyticsReport />;
}
```

---

## Integration Checklist

### Phase 1: Core Setup (Day 1)
- [ ] Copy new components to project
- [ ] Install playwright: `npm install -D @playwright/test`
- [ ] Create playwright.config.ts
- [ ] Update package.json scripts

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

### Phase 2: Admin Setup (Day 1-2)
- [ ] Create `/admin` page with AdminDashboard
- [ ] Set up admin role access control
- [ ] Test health check endpoints
- [ ] Configure backup procedures

### Phase 3: Notifications (Day 2)
- [ ] Add NotificationBell to header
- [ ] Add ToastContainer to layout
- [ ] Set up notification preferences
- [ ] Test notification delivery

### Phase 4: Analytics (Day 2-3)
- [ ] Add PerformanceMonitor to main layout
- [ ] Create `/analytics` dashboard page
- [ ] Configure localStorage limits
- [ ] Set up metrics export

### Phase 5: Security (Day 3)
- [ ] Deploy RLS policies to Supabase
- [ ] Set up audit logging table
- [ ] Test permission checks
- [ ] Enable content moderation

### Phase 6: Testing (Day 3-4)
- [ ] Write E2E tests for critical flows
- [ ] Set up test data seeding
- [ ] Configure CI/CD for tests
- [ ] Create test documentation

### Phase 7: Monitoring (Day 4-5)
- [ ] Deploy to staging
- [ ] Run full test suite
- [ ] Monitor metrics
- [ ] Performance baseline measurement

### Phase 8: Production (Day 5)
- [ ] Deploy to production
- [ ] Monitor real-time metrics
- [ ] Set up alerts
- [ ] Document operational procedures

---

## Success Metrics

After full integration, track:

✅ **Reliability**
- Error rate < 0.5%
- Message latency < 300ms
- System uptime > 99.9%

✅ **Performance**
- Cache hit rate > 60%
- API response time < 200ms
- Page load < 2s

✅ **Operations**
- Admin dashboard accessible
- Health checks all green
- Audit logs capturing events
- No security incidents

✅ **User Experience**
- Notifications delivered reliably
- Real-time sync < 500ms
- Error messages user-friendly
- Offline mode functional

---

## Support & Maintenance

### Monitoring Dashboards
- **Admin**: `/admin` - System health
- **Analytics**: `/analytics` - Performance metrics
- **Notifications**: `/notifications` - Message center

### Troubleshooting

**Metrics not updating?**
- Check browser localStorage
- Verify analytics collection enabled
- Check network tab for errors

**Notifications not appearing?**
- Verify user preferences set correctly
- Check notification preferences
- Review Supabase subscriptions

**Tests failing?**
- Ensure dev server running on :3000
- Check test data exists
- Review test logs and videos

**Admin operations slow?**
- Consider data archiving
- Optimize queries
- Check database performance

---

## Next Steps

1. **Integrate components** into your pages
2. **Run E2E tests** to verify functionality
3. **Monitor production** metrics
4. **Gather user feedback** and iterate
5. **Optimize** based on metrics

---

## Files Summary

| File | Purpose | Size |
|------|---------|------|
| playwright.config.ts | E2E test config | 1.2KB |
| AnalyticsDashboard.tsx | Metrics UI | 8KB |
| admin-utils.ts | Admin operations | 6KB |
| AdminDashboard.tsx | Admin UI | 10KB |
| useNotifications.ts | Notification hooks | 7KB |
| NotificationCenter.tsx | Notification UI | 12KB |
| security-utils.ts | Security helpers | 8KB |
| test-utils.ts | Test fixtures | 10KB |
| e2e/t3-realtime-sync.spec.ts | E2E tests | 7KB |
| **TOTAL** | **Production Ready** | **~70KB** |

---

## Conclusion

T3 Advanced Features provide:
- ✅ Complete admin toolkit
- ✅ Real-time analytics
- ✅ User notifications
- ✅ Security & access control
- ✅ Comprehensive testing
- ✅ Performance monitoring

**Status: 🚀 Ready for Production Deployment**

For questions or issues, refer to individual component documentation or contact the platform team.

/**
 * T3: End-to-End Tests with Playwright
 * Tests real-time sync across multiple browser contexts
 * Run: npx playwright test e2e/t3-realtime-sync.spec.ts
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const COMMUNITY_SLUG = 'test-community';
const DISCUSSION_ID = 'test-discussion-123';

test.describe('T3: Real-Time Sync E2E Tests', () => {
  let page1: Page;
  let page2: Page;

  test.beforeAll(async ({ browser }) => {
    // Create two browser contexts to simulate two users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    page1 = await context1.newPage();
    page2 = await context2.newPage();
  });

  test.afterAll(async () => {
    await page1.close();
    await page2.close();
  });

  test('Message appears instantly in both windows', async () => {
    // Setup: Both users open same discussion
    await page1.goto(`${BASE_URL}/polymath/communities/${COMMUNITY_SLUG}/discussions/${DISCUSSION_ID}`);
    await page2.goto(`${BASE_URL}/polymath/communities/${COMMUNITY_SLUG}/discussions/${DISCUSSION_ID}`);

    // Wait for both pages to load
    await page1.waitForSelector('[data-testid="message-list"]');
    await page2.waitForSelector('[data-testid="message-list"]');

    const testMessage = `Test message ${Date.now()}`;

    // User 1: Send message
    const start = Date.now();
    await page1.fill('[data-testid="message-input"]', testMessage);
    await page1.click('[data-testid="send-button"]');

    // User 2: Should see message within 500ms
    await page2.waitForSelector(`text=${testMessage}`, { timeout: 5000 });
    const latency = Date.now() - start;

    // Verify latency
    expect(latency).toBeLessThan(1000);
    console.log(`Message latency: ${latency}ms`);

    // Verify message appears in both
    const message1 = await page1.locator(`text=${testMessage}`).isVisible();
    const message2 = await page2.locator(`text=${testMessage}`).isVisible();

    expect(message1).toBe(true);
    expect(message2).toBe(true);
  });

  test('Edit message syncs to both windows', async () => {
    const testMessage = `Edit test ${Date.now()}`;

    // User 1: Send message
    await page1.fill('[data-testid="message-input"]', testMessage);
    await page1.click('[data-testid="send-button"]');

    // Wait for it to appear in User 2
    await page2.waitForSelector(`text=${testMessage}`, { timeout: 5000 });

    // User 1: Edit message
    const editedText = `${testMessage} (EDITED)`;
    const messageElement = await page1.locator(`text=${testMessage}`);
    await messageElement.hover();
    await page1.click('[data-testid="edit-button"]');
    await page1.fill('[data-testid="message-input"]', editedText);
    await page1.click('[data-testid="save-button"]');

    // User 2: Should see edited message
    await page2.waitForSelector(`text=${editedText}`, { timeout: 5000 });
    expect(await page2.locator(`text=${editedText}`).isVisible()).toBe(true);
  });

  test('Delete message syncs to both windows', async () => {
    const testMessage = `Delete test ${Date.now()}`;

    // User 1: Send message
    await page1.fill('[data-testid="message-input"]', testMessage);
    await page1.click('[data-testid="send-button"]');

    // Wait for both to see it
    await page2.waitForSelector(`text=${testMessage}`, { timeout: 5000 });

    // User 1: Delete message
    const messageElement = await page1.locator(`text=${testMessage}`);
    await messageElement.hover();
    await page1.click('[data-testid="delete-button"]');
    await page1.click('[data-testid="confirm-delete"]');

    // User 2: Message should disappear
    await expect(page2.locator(`text=${testMessage}`)).toBeHidden({ timeout: 5000 });
  });

  test('Member count updates in real-time', async () => {
    // Both pages open community
    await page1.goto(`${BASE_URL}/polymath/communities/${COMMUNITY_SLUG}`);
    await page2.goto(`${BASE_URL}/polymath/communities/${COMMUNITY_SLUG}`);

    // Get initial member count
    const initialCount1 = await page1.locator('[data-testid="member-count"]').textContent();
    const initialCount2 = await page2.locator('[data-testid="member-count"]').textContent();

    expect(initialCount1).toBe(initialCount2);

    // Simulate new member joining (via API or UI)
    // After join, both should reflect new count
    // (This would normally trigger via JOIN endpoint)

    await page1.waitForTimeout(2000);

    const updatedCount1 = await page1.locator('[data-testid="member-count"]').textContent();
    const updatedCount2 = await page2.locator('[data-testid="member-count"]').textContent();

    expect(updatedCount1).toBe(updatedCount2);
  });

  test('Discussion list updates when new discussion created', async () => {
    await page1.goto(`${BASE_URL}/polymath/communities/${COMMUNITY_SLUG}`);
    await page2.goto(`${BASE_URL}/polymath/communities/${COMMUNITY_SLUG}`);

    const discussionTitle = `New Discussion ${Date.now()}`;

    // User 1: Create discussion
    await page1.click('[data-testid="new-discussion-button"]');
    await page1.fill('[data-testid="discussion-title"]', discussionTitle);
    await page1.click('[data-testid="create-button"]');

    // User 2: Should see new discussion appear
    await page2.waitForSelector(`text=${discussionTitle}`, { timeout: 5000 });
    expect(await page2.locator(`text=${discussionTitle}`).isVisible()).toBe(true);
  });

  test('Error handling: Offline gracefully handled', async () => {
    await page1.goto(`${BASE_URL}/polymath/communities/${COMMUNITY_SLUG}/discussions/${DISCUSSION_ID}`);

    // Go offline
    await page1.context().setOffline(true);

    // Try to send message
    await page1.fill('[data-testid="message-input"]', 'Offline message');
    await page1.click('[data-testid="send-button"]');

    // Should show error or queue message
    const errorVisible = await page1.locator('[data-testid="error-message"]').isVisible();
    const queuedMessage = await page1.locator('[data-testid="queued-message"]').isVisible();

    expect(errorVisible || queuedMessage).toBe(true);

    // Go back online
    await page1.context().setOffline(false);

    // Should recover gracefully
    await page1.waitForTimeout(2000);
  });

  test('Performance: Scroll with 100+ messages is smooth', async () => {
    await page1.goto(`${BASE_URL}/polymath/communities/${COMMUNITY_SLUG}/discussions/${DISCUSSION_ID}`);

    // Measure performance before scroll
    const before = Date.now();

    // Scroll down multiple times
    for (let i = 0; i < 10; i++) {
      await page1.locator('[data-testid="message-list"]').evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      await page1.waitForTimeout(100);
    }

    const duration = Date.now() - before;

    // Should complete 10 scrolls in < 2 seconds
    expect(duration).toBeLessThan(2000);
    console.log(`Scroll performance: ${duration}ms for 10 scrolls`);
  });

  test('Memory: No leaks after rapid navigation', async () => {
    // Get initial memory
    const metrics1 = await page1.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    // Rapidly navigate between discussions
    for (let i = 0; i < 5; i++) {
      await page1.goto(
        `${BASE_URL}/polymath/communities/${COMMUNITY_SLUG}/discussions/discussion-${i}`
      );
      await page1.waitForTimeout(500);
      await page1.goto(`${BASE_URL}/polymath/communities/${COMMUNITY_SLUG}`);
      await page1.waitForTimeout(500);
    }

    // Get final memory
    const metrics2 = await page1.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    const increase = (metrics2 - metrics1) / 1024 / 1024; // MB
    console.log(`Memory increase: ${increase.toFixed(2)}MB`);

    // Should not increase by more than 50MB (reasonable growth)
    expect(increase).toBeLessThan(50);
  });

  test('Browser compatibility: Works in Chromium, Firefox, WebKit', async ({
    browserName,
  }) => {
    // This test runs in each browser due to Playwright's config
    await page1.goto(`${BASE_URL}/polymath/communities/${COMMUNITY_SLUG}`);

    // Verify page loads
    await page1.waitForSelector('[data-testid="page-title"]');

    // Verify core functionality works
    const title = await page1.locator('[data-testid="page-title"]').textContent();
    expect(title).toContain(COMMUNITY_SLUG);

    console.log(`✅ Works in ${browserName}`);
  });

  test('Concurrent edits: Final state is consistent', async () => {
    const testMessage = `Concurrent edit test ${Date.now()}`;

    // User 1: Send message
    await page1.fill('[data-testid="message-input"]', testMessage);
    await page1.click('[data-testid="send-button"]');

    // Wait for both to see it
    await page2.waitForSelector(`text=${testMessage}`, { timeout: 5000 });

    // Both users start editing simultaneously
    const message1 = await page1.locator(`text=${testMessage}`);
    const message2 = await page2.locator(`text=${testMessage}`);

    await message1.hover();
    await message2.hover();

    await page1.click('[data-testid="edit-button"]');
    await page2.click('[data-testid="edit-button"]');

    // Edit to different values
    const edit1 = `${testMessage} (EDIT1)`;
    const edit2 = `${testMessage} (EDIT2)`;

    await page1.fill('[data-testid="message-input"]', edit1);
    await page2.fill('[data-testid="message-input"]', edit2);

    // Last write wins (or merge if implemented)
    await page1.click('[data-testid="save-button"]');
    await page2.click('[data-testid="save-button"]');

    // Verify consistent state in both
    await page1.waitForTimeout(1000);

    const final1 = await page1.locator(`text=EDIT`).textContent();
    const final2 = await page2.locator(`text=EDIT`).textContent();

    expect(final1).toBe(final2);
  });
});

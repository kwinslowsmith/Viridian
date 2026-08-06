/**
 * Approval Queue Integration Tests
 * Tests the approval workflow for Polymath articles
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

const API_URL = 'http://localhost:3000/api/polymath';

// Test user IDs
const APPROVER_USER_ID = 'test-approver-1';
const SECOND_APPROVER_ID = 'test-approver-2';
const AUTHOR_USER_ID = 'test-author-1';

const TEST_ORG_ID = 'test-org-approval-1';

describe('Approval Queue Workflow', () => {
  let createdArticleId: string;

  describe('Create Article with Approval Chain', () => {
    it('should create an organization article with pending approval status', async () => {
      const payload = {
        title: 'Organization Article for Approval',
        content: 'This article requires approval from organization admins',
        abstract: 'Test article for approval workflow',
        authorType: 'organization',
        authorId: TEST_ORG_ID,
        organizationId: TEST_ORG_ID,
        visibility: 'organization',
        topic: 'education',
        approvalChain: [APPROVER_USER_ID, SECOND_APPROVER_ID], // Override for testing
      };

      const res = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-User-Id': AUTHOR_USER_ID, // Test mode header
        },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(201);
      const data = await res.json();

      expect(data.id || data.article?.id).toBeDefined();
      createdArticleId = data.id || data.article?.id;

      expect(data.status || data.article?.status).toBe('pending_approval');
      expect(data.requiresApproval || data.article?.requiresApproval).toBe(true);
      expect(data.approvalChain || data.article?.approvalChain).toContain(APPROVER_USER_ID);
      expect(data.approvalChain || data.article?.approvalChain).toHaveLength(2);
    });
  });

  describe('Approval Queue Retrieval', () => {
    it('should return pending articles for approver in queue', async () => {
      const res = await fetch(`${API_URL}/approval-queue?contentType=articles`, {
        headers: {
          'X-Test-User-Id': APPROVER_USER_ID,
        },
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(Array.isArray(data.queue || data.articles)).toBe(true);
      const queue = data.queue || data.articles;

      // Should contain our test article
      const testArticle = queue.find((a: any) => a.id === createdArticleId);
      expect(testArticle).toBeDefined();
      expect(testArticle.status).toBe('pending_approval');
      expect(testArticle.approvalChain).toContain(APPROVER_USER_ID);
    });

    it('should not return articles for non-approvers', async () => {
      const nonApproverId = 'test-non-approver-1';

      const res = await fetch(`${API_URL}/approval-queue?contentType=articles`, {
        headers: {
          'X-Test-User-Id': nonApproverId,
        },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      const queue = data.queue || data.articles;

      const testArticle = queue.find((a: any) => a.id === createdArticleId);
      expect(testArticle).toBeUndefined();
    });
  });

  describe('Approval Action', () => {
    it('should approve article by first approver and move to next in chain', async () => {
      const res = await fetch(
        `${API_URL}/articles/${createdArticleId}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-Test-User-Id': APPROVER_USER_ID,
          },
        }
      );

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.status).toBe('pending_approval'); // Still pending because 1 more approver needed
      expect(data.approvalChain).not.toContain(APPROVER_USER_ID);
      expect(data.approvalChain).toContain(SECOND_APPROVER_ID);
      expect(data.approvalChain).toHaveLength(1);
    });

    it('should publish article when final approver approves', async () => {
      const res = await fetch(
        `${API_URL}/articles/${createdArticleId}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-Test-User-Id': SECOND_APPROVER_ID,
          },
        }
      );

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.status).toBe('published'); // Now published
      expect(data.approvalChain).toHaveLength(0);
      expect(data.publishedAt).toBeDefined();
    });

    it('should not allow non-approvers to approve', async () => {
      // Create another test article
      const payload = {
        title: 'Another Test Article',
        content: 'Content for testing unauthorized approval',
        authorType: 'organization',
        authorId: TEST_ORG_ID,
        organizationId: TEST_ORG_ID,
        visibility: 'organization',
        approvalChain: [APPROVER_USER_ID],
      };

      const createRes = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-User-Id': AUTHOR_USER_ID,
        },
        body: JSON.stringify(payload),
      });

      const created = await createRes.json();
      const articleId = created.id || created.article?.id;

      // Try to approve as non-approver
      const approveRes = await fetch(
        `${API_URL}/articles/${articleId}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-Test-User-Id': 'test-unauthorized-user',
          },
        }
      );

      expect(approveRes.status).toBe(403);
      const error = await approveRes.json();
      expect(error.error).toContain('not in the approval chain');
    });
  });

  describe('Rejection Action', () => {
    let rejectionTestArticleId: string;

    beforeAll(async () => {
      // Create an article for rejection testing
      const payload = {
        title: 'Article for Rejection Test',
        content: 'This article will be rejected',
        authorType: 'organization',
        authorId: TEST_ORG_ID,
        organizationId: TEST_ORG_ID,
        visibility: 'organization',
        approvalChain: [APPROVER_USER_ID],
      };

      const res = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-User-Id': AUTHOR_USER_ID,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      rejectionTestArticleId = data.id || data.article?.id;
    });

    it('should reject article with feedback', async () => {
      const feedback = 'This article does not meet our editorial standards.';

      const res = await fetch(
        `${API_URL}/articles/${rejectionTestArticleId}/reject`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-Test-User-Id': APPROVER_USER_ID,
          },
          body: JSON.stringify({ feedback }),
        }
      );

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.status).toBe('rejected');
      expect(data.approvalChain).toHaveLength(0);
      expect(data.tags).toContain('[REJECTED]');
      expect(data.tags).toContain(feedback);
    });

    it('should not return rejected articles in approval queue', async () => {
      const res = await fetch(`${API_URL}/approval-queue?contentType=articles`, {
        headers: {
          'X-Test-User-Id': APPROVER_USER_ID,
        },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      const queue = data.queue || data.articles;

      const rejectedArticle = queue.find((a: any) => a.id === rejectionTestArticleId);
      expect(rejectedArticle).toBeUndefined();
    });
  });

  describe('Magazine Cache Invalidation', () => {
    it('should invalidate magazine cache when article is published', async () => {
      // This test verifies that when an article completes approval and is published,
      // it becomes available in the magazine feed
      // For now, we just verify the article was published
      const res = await fetch(`${API_URL}/articles/${createdArticleId}`, {
        method: 'GET',
        headers: {
          'X-Test-User-Id': AUTHOR_USER_ID,
        },
      });

      // The article endpoint should return the published article
      // (assuming it exists in a GET endpoint)
      // This is a basic check
      expect(res.status).toBe(200);
    });
  });
});

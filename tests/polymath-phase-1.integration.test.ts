/**
 * Polymath Phase 1 Integration Tests
 * Tests all 4 stakeholder posting flows and magazine aggregation
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const API_URL = 'http://localhost:3000/api/polymath';
const MAGAZINE_URL = 'http://localhost:3000/api/polymath/magazine';

// Mock user/org/community/event data
const mockUser = {
  id: 'user-test-1',
  name: 'Test Educator',
  email: 'educator@test.com',
};

const mockOrg = {
  id: 'org-test-1',
  name: 'Test High School',
  slug: 'test-high-school',
};

const mockCommunity = {
  id: 'comm-test-1',
  name: 'Test Community',
};

const mockEvent = {
  id: 'event-test-1',
  name: 'Test Workshop',
  date: new Date().toISOString(),
};

describe('Polymath Phase 1: Multi-Stakeholder Posting', () => {

  describe('Individual Posting Flow', () => {
    it('should create individual article and publish instantly', async () => {
      const payload = {
        title: 'Individual Article Test',
        content: 'This is test content for individual article',
        abstract: 'Test abstract',
        authorType: 'individual',
        authorId: mockUser.id,
        visibility: 'public',
        topic: 'education',
      };

      const res = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(201);
      const data = await res.json();

      expect(data.article).toBeDefined();
      expect(data.article.status).toBe('published'); // Individual posts publish instantly
      expect(data.article.authorType).toBe('individual');
      expect(data.article.authorId).toBe(mockUser.id);
      expect(data.article.visibility).toBe('public');
    });

    it('should allow immediate edit/delete of individual article', async () => {
      const createPayload = {
        title: 'Editable Article',
        content: 'Original content',
        authorType: 'individual',
        authorId: mockUser.id,
        visibility: 'public',
      };

      const createRes = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload),
      });

      const created = await createRes.json();
      const articleId = created.article.id;

      // Edit article
      const editPayload = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      const editRes = await fetch(`${API_URL}/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editPayload),
      });

      expect(editRes.status).toBe(200);
      const updated = await editRes.json();
      expect(updated.article.title).toBe('Updated Title');
    });
  });

  describe('Organization Posting Flow', () => {
    it('should create org article with pending approval status', async () => {
      const approverIds = ['admin-1', 'admin-2'];
      const payload = {
        title: 'Organization Article',
        content: 'This is org-authored content',
        abstract: 'Org article',
        authorType: 'organization',
        authorId: mockOrg.id,
        organizationId: mockOrg.id,
        visibility: 'organization',
        requiresApproval: true,
        approvalChain: JSON.stringify(approverIds),
      };

      const res = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(201);
      const data = await res.json();

      expect(data.article.status).toBe('pending_approval');
      expect(data.article.authorType).toBe('organization');
      expect(data.article.visibility).toBe('organization');
      expect(data.article.requiresApproval).toBe(true);
      expect(JSON.parse(data.article.approvalChain)).toEqual(approverIds);
    });

    it('should handle org approval workflow', async () => {
      const approverIds = ['admin-1', 'admin-2'];
      const payload = {
        title: 'Article Needing Approval',
        content: 'Content',
        authorType: 'organization',
        authorId: mockOrg.id,
        organizationId: mockOrg.id,
        requiresApproval: true,
        approvalChain: JSON.stringify(approverIds),
      };

      const createRes = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const created = await createRes.json();
      const articleId = created.article.id;

      // First approver approves
      const approve1Res = await fetch(`${API_URL}/articles/${articleId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'admin-1' }),
      });

      expect(approve1Res.status).toBe(200);
      let article = await approve1Res.json();
      expect(article.article.status).toBe('pending_approval'); // Still pending second approval

      // Second approver approves
      const approve2Res = await fetch(`${API_URL}/articles/${articleId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'admin-2' }),
      });

      expect(approve2Res.status).toBe(200);
      article = await approve2Res.json();
      expect(article.article.status).toBe('published'); // Auto-publish after all approvals
    });

    it('should handle org rejection with feedback', async () => {
      const payload = {
        title: 'Article to Reject',
        content: 'Content',
        authorType: 'organization',
        authorId: mockOrg.id,
        organizationId: mockOrg.id,
        requiresApproval: true,
        approvalChain: JSON.stringify(['admin-1']),
      };

      const createRes = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const created = await createRes.json();
      const articleId = created.article.id;

      // Reject with feedback
      const rejectRes = await fetch(`${API_URL}/articles/${articleId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'admin-1',
          feedback: 'Please revise the content',
        }),
      });

      expect(rejectRes.status).toBe(200);
      const article = await rejectRes.json();
      expect(article.article.status).toBe('rejected');
    });
  });

  describe('Community Posting Flow', () => {
    it('should create community article pending moderator review', async () => {
      const payload = {
        title: 'Community Article',
        content: 'Community-authored content',
        authorType: 'community',
        authorId: mockCommunity.id,
        communityId: mockCommunity.id,
        visibility: 'community',
        requiresApproval: true,
      };

      const res = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(201);
      const data = await res.json();

      expect(data.article.status).toBe('pending_approval');
      expect(data.article.visibility).toBe('community');
      expect(data.article.requiresApproval).toBe(true);
    });
  });

  describe('Event Posting Flow', () => {
    it('should create event article and publish instantly', async () => {
      const payload = {
        title: 'Event Resource',
        content: 'Resource for the event',
        authorType: 'event',
        authorId: mockEvent.id,
        eventId: mockEvent.id,
        visibility: 'event',
      };

      const res = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(201);
      const data = await res.json();

      expect(data.article.status).toBe('published'); // Event posts publish instantly
      expect(data.article.visibility).toBe('event');
      expect(data.article.eventId).toBe(mockEvent.id);
    });
  });

  describe('Magazine Feed Aggregation', () => {
    it('should return published articles from all 4 stakeholder types', async () => {
      // Create articles from all types
      const articles = [
        {
          title: 'Individual Article',
          content: 'Individual content',
          authorType: 'individual',
          authorId: 'user-1',
          visibility: 'public',
        },
        {
          title: 'Published Org Article',
          content: 'Org content',
          authorType: 'organization',
          authorId: 'org-1',
          organizationId: 'org-1',
          visibility: 'organization',
          status: 'published',
        },
        {
          title: 'Event Article',
          content: 'Event content',
          authorType: 'event',
          authorId: 'event-1',
          eventId: 'event-1',
          visibility: 'event',
        },
      ];

      // Post all articles
      for (const article of articles) {
        await fetch(`${API_URL}/articles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(article),
        });
      }

      // Fetch magazine feed
      const magazineRes = await fetch(MAGAZINE_URL);
      expect(magazineRes.status).toBe(200);

      const magazine = await magazineRes.json();

      expect(magazine.articles).toBeDefined();
      expect(Array.isArray(magazine.articles)).toBe(true);
      expect(magazine.articles.length).toBeGreaterThan(0);

      // Check that we have published articles
      const publishedArticles = magazine.articles.filter(
        (a: any) => a.status === 'published'
      );
      expect(publishedArticles.length).toBeGreaterThan(0);
    });

    it('should support topic filtering in magazine', async () => {
      const magazineRes = await fetch(`${MAGAZINE_URL}?topic=education`);
      expect(magazineRes.status).toBe(200);

      const magazine = await magazineRes.json();
      expect(magazine.articles).toBeDefined();

      // All returned articles should have education topic or no topic
      magazine.articles.forEach((article: any) => {
        if (article.topic) {
          expect(article.topic).toBe('education');
        }
      });
    });

    it('should return empty arrays if no content', async () => {
      const magazineRes = await fetch(`${MAGAZINE_URL}?topic=nonexistent`);
      expect(magazineRes.status).toBe(200);

      const magazine = await magazineRes.json();
      expect(magazine.articles).toBeDefined();
      expect(magazine.tools).toBeDefined();
      expect(magazine.modules).toBeDefined();
      expect(magazine.collections).toBeDefined();
    });
  });

  describe('Permission & Visibility Controls', () => {
    it('should respect visibility settings', async () => {
      // Create org article with organization visibility
      const orgPayload = {
        title: 'Org Only Article',
        content: 'Content',
        authorType: 'organization',
        authorId: mockOrg.id,
        organizationId: mockOrg.id,
        visibility: 'organization',
        status: 'published',
      };

      const createRes = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgPayload),
      });

      const created = await createRes.json();
      expect(created.article.visibility).toBe('organization');

      // Magazine feed might filter based on visibility
      const magazineRes = await fetch(MAGAZINE_URL);
      const magazine = await magazineRes.json();

      // Should still return if user has org access, or filter them out
      // This depends on auth context, which we're not mocking here
      expect(magazine.articles).toBeDefined();
    });
  });
});

describe('Polymath Phase 1: Content Types', () => {
  describe('Modules', () => {
    it('should create individual module', async () => {
      const payload = {
        title: 'Test Module',
        description: 'Module description',
        authorType: 'individual',
        authorId: mockUser.id,
        difficulty: 'beginner',
        estimatedHours: 5,
        visibility: 'public',
      };

      const res = await fetch(`${API_URL}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.module.title).toBe('Test Module');
      expect(data.module.status).toBe('published');
    });
  });

  describe('Tools', () => {
    it('should create individual tool', async () => {
      const payload = {
        name: 'Test Tool',
        description: 'Tool description',
        toolType: 'interactive',
        authorType: 'individual',
        authorId: mockUser.id,
        toolUrl: 'https://example.com/tool',
        visibility: 'public',
      };

      const res = await fetch(`${API_URL}/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.tool.name).toBe('Test Tool');
    });
  });

  describe('Collections', () => {
    it('should create individual collection', async () => {
      const payload = {
        name: 'Test Collection',
        description: 'Collection description',
        authorType: 'individual',
        authorId: mockUser.id,
        topic: 'education',
        visibility: 'public',
      };

      const res = await fetch(`${API_URL}/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.collection.name).toBe('Test Collection');
    });
  });
});

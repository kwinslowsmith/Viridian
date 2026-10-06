/**
 * Security & Access Control Utilities
 * RLS policies, permission checking, encryption
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// TYPES
// ============================================================================

export type Permission =
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'admin'
  | 'moderate';

export type ResourceType =
  | 'community'
  | 'discussion'
  | 'message'
  | 'member'
  | 'settings';

export interface AccessContext {
  userId: string;
  resourceId: string;
  resourceType: ResourceType;
  resourceOwnerId?: string;
  communityId?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  communityId?: string;
}

// ============================================================================
// PERMISSION CHECKING
// ============================================================================

export async function checkPermission(
  context: AccessContext,
  requiredPermission: Permission
): Promise<boolean> {
  const { userId, resourceId, resourceType, communityId } = context;

  try {
    // Admin bypass
    const isAdmin = await isUserAdmin(userId, communityId);
    if (isAdmin && requiredPermission !== 'delete') {
      return true;
    }

    // Check user role permissions
    const hasPermission = await checkUserPermission(
      userId,
      resourceType,
      requiredPermission,
      communityId
    );

    if (!hasPermission) {
      return false;
    }

    // Check resource-level access
    if (resourceType === 'message') {
      return await canAccessMessage(userId, resourceId);
    }

    if (resourceType === 'discussion') {
      return await canAccessDiscussion(userId, resourceId);
    }

    if (resourceType === 'community') {
      return await canAccessCommunity(userId, resourceId);
    }

    return true;
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}

async function checkUserPermission(
  userId: string,
  resourceType: ResourceType,
  permission: Permission,
  communityId?: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('UserRole')
      .select('Role(permissions)')
      .eq('userId', userId)
      .eq('communityId', communityId || 'null');

    if (error || !data) return false;

    const roles = data.map((ur: any) => ur.Role);
    const allPermissions = new Set<Permission>();

    roles.forEach((role: any) => {
      if (role?.permissions?.includes(permission)) {
        allPermissions.add(permission);
      }
    });

    return allPermissions.has(permission);
  } catch (error) {
    console.error('Failed to check user permission:', error);
    return false;
  }
}

async function isUserAdmin(userId: string, communityId?: string): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('UserRole')
      .select('count', { count: 'exact', head: true })
      .eq('userId', userId)
      .eq('role', 'admin')
      .eq('communityId', communityId || 'null');

    return !error && (count || 0) > 0;
  } catch (error) {
    return false;
  }
}

async function canAccessMessage(userId: string, messageId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('DiscussionMessage')
      .select('discussionId, userId')
      .eq('id', messageId)
      .single();

    if (error || !data) return false;

    // Can access own messages
    if (data.userId === userId) return true;

    // Can access if in the discussion
    return await canAccessDiscussion(userId, data.discussionId);
  } catch (error) {
    return false;
  }
}

async function canAccessDiscussion(userId: string, discussionId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('Discussion')
      .select('communityId, private')
      .eq('id', discussionId)
      .single();

    if (error || !data) return false;

    // Private discussions: check membership
    if (data.private) {
      return await isCommunityMember(userId, data.communityId);
    }

    // Public: check if community member
    return await isCommunityMember(userId, data.communityId);
  } catch (error) {
    return false;
  }
}

async function canAccessCommunity(userId: string, communityId: string): Promise<boolean> {
  try {
    const { data: community, error: comError } = await supabase
      .from('Community')
      .select('private')
      .eq('id', communityId)
      .single();

    if (comError || !community) return false;

    // Private communities require membership
    if (community.private) {
      return await isCommunityMember(userId, communityId);
    }

    return true;
  } catch (error) {
    return false;
  }
}

async function isCommunityMember(userId: string, communityId: string): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('CommunityMember')
      .select('count', { count: 'exact', head: true })
      .eq('userId', userId)
      .eq('communityId', communityId);

    return !error && (count || 0) > 0;
  } catch (error) {
    return false;
  }
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

export async function logAuditEvent(
  userId: string,
  action: string,
  resourceType: ResourceType,
  resourceId: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    await supabase.from('AuditLog').insert({
      userId,
      action,
      resourceType,
      resourceId,
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

export async function getAuditLogs(
  resourceType: ResourceType,
  resourceId: string,
  limit: number = 100
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('AuditLog')
      .select('*')
      .eq('resourceType', resourceType)
      .eq('resourceId', resourceId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}

// ============================================================================
// DATA ENCRYPTION
// ============================================================================

export function encryptSensitiveData(data: string, key?: string): string {
  // In production, use proper encryption libraries like TweetNaCl.js or libsodium
  // This is a placeholder using base64 encoding for demonstration
  if (!key) {
    key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key';
  }

  try {
    return Buffer.from(data).toString('base64');
  } catch (error) {
    console.error('Encryption failed:', error);
    return '';
  }
}

export function decryptSensitiveData(encrypted: string, key?: string): string {
  // In production, use proper decryption libraries
  if (!key) {
    key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key';
  }

  try {
    return Buffer.from(encrypted, 'base64').toString('utf-8');
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}

// ============================================================================
// RATE LIMITING & ABUSE PREVENTION
// ============================================================================

const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const existing = rateLimitCache.get(key);

  if (!existing) {
    rateLimitCache.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (now > existing.resetTime) {
    rateLimitCache.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  existing.count++;

  if (existing.count > maxRequests) {
    return false;
  }

  return true;
}

export function getRateLimitStatus(key: string): { remaining: number; resetTime: number } | null {
  const existing = rateLimitCache.get(key);
  if (!existing) return null;

  const now = Date.now();
  if (now > existing.resetTime) {
    return null;
  }

  return {
    remaining: Math.max(0, 100 - existing.count),
    resetTime: existing.resetTime - now,
  };
}

// ============================================================================
// CONTENT MODERATION
// ============================================================================

const bannedWords = [
  'spam',
  'abuse',
  // Add more as needed
];

export function scanForBannedContent(content: string): {
  isSafe: boolean;
  flaggedWords: string[];
} {
  const lowerContent = content.toLowerCase();
  const flaggedWords = bannedWords.filter((word) => lowerContent.includes(word));

  return {
    isSafe: flaggedWords.length === 0,
    flaggedWords,
  };
}

export async function flagContentForReview(
  userId: string,
  resourceType: ResourceType,
  resourceId: string,
  reason: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    await supabase.from('ContentFlag').insert({
      userId,
      resourceType,
      resourceId,
      reason,
      details,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to flag content:', error);
  }
}

// ============================================================================
// SESSION SECURITY
// ============================================================================

export async function validateSession(token: string): Promise<{ valid: boolean; userId?: string }> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { valid: false };
    }

    return { valid: true, userId: user.id };
  } catch (error) {
    console.error('Session validation failed:', error);
    return { valid: false };
  }
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .slice(0, 10000); // Limit length
}

export function sanitizeHtml(html: string): string {
  // Use a proper HTML sanitization library like DOMPurify in production
  return sanitizeInput(html);
}

// ============================================================================
// RLS POLICY HELPERS
// ============================================================================

export const RLS_POLICIES = {
  // Communities
  COMMUNITY_SELECT: `
    SELECT * FROM "Community"
    WHERE "private" = false
    OR "id" IN (SELECT "communityId" FROM "CommunityMember" WHERE "userId" = auth.uid())
  `,

  // Discussions
  DISCUSSION_SELECT: `
    SELECT * FROM "Discussion"
    WHERE "communityId" IN (
      SELECT "id" FROM "Community"
      WHERE "private" = false
      OR "id" IN (SELECT "communityId" FROM "CommunityMember" WHERE "userId" = auth.uid())
    )
  `,

  // Messages
  MESSAGE_SELECT: `
    SELECT * FROM "DiscussionMessage"
    WHERE "discussionId" IN (
      SELECT "id" FROM "Discussion"
      WHERE "communityId" IN (
        SELECT "id" FROM "Community"
        WHERE "private" = false
        OR "id" IN (SELECT "communityId" FROM "CommunityMember" WHERE "userId" = auth.uid())
      )
    )
  `,

  MESSAGE_INSERT: `
    CREATE POLICY "Users can insert messages in discussions they have access to" ON "DiscussionMessage"
    FOR INSERT WITH CHECK (
      "discussionId" IN (
        SELECT "id" FROM "Discussion"
        WHERE "communityId" IN (
          SELECT "communityId" FROM "CommunityMember" WHERE "userId" = auth.uid()
        )
      )
      AND "userId" = auth.uid()
    )
  `,

  MESSAGE_UPDATE: `
    CREATE POLICY "Users can update their own messages" ON "DiscussionMessage"
    FOR UPDATE USING ("userId" = auth.uid())
    WITH CHECK ("userId" = auth.uid())
  `,

  MESSAGE_DELETE: `
    CREATE POLICY "Users can delete their own messages or admins can delete any" ON "DiscussionMessage"
    FOR DELETE USING (
      "userId" = auth.uid()
      OR (
        SELECT "role" FROM "UserRole"
        WHERE "userId" = auth.uid()
        AND "communityId" = (
          SELECT "communityId" FROM "Discussion" WHERE "id" = "discussionId"
        )
      ) = 'admin'
    )
  `,
};

export function generateRLSPolicies(): string {
  return `
-- Enable RLS on tables
ALTER TABLE "Community" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Discussion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DiscussionMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CommunityMember" ENABLE ROW LEVEL SECURITY;

-- Communities: Public communities visible to all, private to members only
${RLS_POLICIES.COMMUNITY_SELECT};

-- Discussions: Visible if community is accessible
${RLS_POLICIES.DISCUSSION_SELECT};

-- Messages: Visible if discussion is accessible
${RLS_POLICIES.MESSAGE_SELECT};

-- Message Insert: Must have community access and be inserting own message
${RLS_POLICIES.MESSAGE_INSERT};

-- Message Update: Can only update own messages
${RLS_POLICIES.MESSAGE_UPDATE};

-- Message Delete: Can delete own or if admin
${RLS_POLICIES.MESSAGE_DELETE};
  `;
}

/**
 * Admin Utilities for T3 Operations
 * Data cleanup, migration, and bulk operations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// DATA CLEANUP
// ============================================================================

export async function cleanupStaleMessages(
  discussionId: string,
  olderThanDays: number = 30
): Promise<{ deleted: number; error?: string }> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const { data, error: fetchError } = await supabase
      .from('DiscussionMessage')
      .select('id')
      .eq('discussionId', discussionId)
      .lt('createdAt', cutoffDate.toISOString());

    if (fetchError) throw fetchError;

    if (!data || data.length === 0) {
      return { deleted: 0 };
    }

    const messageIds = data.map((m) => m.id);

    const { count, error: deleteError } = await supabase
      .from('DiscussionMessage')
      .delete()
      .in('id', messageIds);

    if (deleteError) throw deleteError;

    return { deleted: count || 0 };
  } catch (error) {
    return {
      deleted: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function cleanupEmptyDiscussions(): Promise<{ deleted: number; error?: string }> {
  try {
    const { data: emptyDiscussions, error: fetchError } = await supabase
      .rpc('get_empty_discussions');

    if (fetchError) throw fetchError;

    if (!emptyDiscussions || emptyDiscussions.length === 0) {
      return { deleted: 0 };
    }

    const discussionIds = emptyDiscussions.map((d: any) => d.id);

    const { count, error: deleteError } = await supabase
      .from('Discussion')
      .delete()
      .in('id', discussionIds);

    if (deleteError) throw deleteError;

    return { deleted: count || 0 };
  } catch (error) {
    return {
      deleted: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function cleanupOrphanedReadReceipts(): Promise<{ deleted: number; error?: string }> {
  try {
    const { count, error } = await supabase.rpc('cleanup_orphaned_read_receipts');

    if (error) throw error;

    return { deleted: count || 0 };
  } catch (error) {
    return {
      deleted: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export async function bulkArchiveDiscussions(
  communityId: string,
  discussionIds: string[]
): Promise<{ updated: number; error?: string }> {
  try {
    const { count, error } = await supabase
      .from('Discussion')
      .update({ archived: true, archivedAt: new Date().toISOString() })
      .eq('communityId', communityId)
      .in('id', discussionIds);

    if (error) throw error;

    return { updated: count || 0 };
  } catch (error) {
    return {
      updated: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function bulkDeleteMessages(messageIds: string[]): Promise<{ deleted: number; error?: string }> {
  try {
    const { count, error } = await supabase
      .from('DiscussionMessage')
      .delete()
      .in('id', messageIds);

    if (error) throw error;

    return { deleted: count || 0 };
  } catch (error) {
    return {
      deleted: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function bulkUpdateMessageStatus(
  messageIds: string[],
  status: 'draft' | 'sent' | 'deleted'
): Promise<{ updated: number; error?: string }> {
  try {
    const { count, error } = await supabase
      .from('DiscussionMessage')
      .update({ status })
      .in('id', messageIds);

    if (error) throw error;

    return { updated: count || 0 };
  } catch (error) {
    return {
      updated: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// DATA MIGRATION
// ============================================================================

export async function migrateDiscussionMessages(
  sourceDiscussionId: string,
  targetDiscussionId: string
): Promise<{ migrated: number; error?: string }> {
  try {
    const { data, error: fetchError } = await supabase
      .from('DiscussionMessage')
      .select('*')
      .eq('discussionId', sourceDiscussionId);

    if (fetchError) throw fetchError;

    if (!data || data.length === 0) {
      return { migrated: 0 };
    }

    const messagesToInsert = data.map((msg) => ({
      ...msg,
      id: undefined,
      discussionId: targetDiscussionId,
      createdAt: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from('DiscussionMessage')
      .insert(messagesToInsert);

    if (insertError) throw insertError;

    return { migrated: data.length };
  } catch (error) {
    return {
      migrated: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function duplicateCommunity(
  sourceCommunityId: string,
  newCommunityName: string,
  newCommunitySlug: string
): Promise<{ communityId?: string; error?: string }> {
  try {
    const { data: sourceCommunity, error: fetchError } = await supabase
      .from('Community')
      .select('*')
      .eq('id', sourceCommunityId)
      .single();

    if (fetchError) throw fetchError;

    const newCommunity = {
      ...sourceCommunity,
      id: undefined,
      name: newCommunityName,
      slug: newCommunitySlug,
      createdAt: new Date().toISOString(),
    };

    const { data: created, error: createError } = await supabase
      .from('Community')
      .insert(newCommunity)
      .select('id')
      .single();

    if (createError) throw createError;

    if (created && created.id) {
      // Copy discussions
      const { data: discussions } = await supabase
        .from('Discussion')
        .select('*')
        .eq('communityId', sourceCommunityId);

      if (discussions && discussions.length > 0) {
        const discussionsToInsert = discussions.map((d) => ({
          ...d,
          id: undefined,
          communityId: created.id,
          createdAt: new Date().toISOString(),
        }));

        await supabase.from('Discussion').insert(discussionsToInsert);
      }
    }

    return { communityId: created?.id };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// DATA EXPORT
// ============================================================================

export async function exportCommunityData(communityId: string): Promise<{
  data?: {
    community: any;
    discussions: any[];
    messages: any[];
    members: any[];
  };
  error?: string;
}> {
  try {
    const [communityResult, discussionsResult, membersResult] = await Promise.all([
      supabase.from('Community').select('*').eq('id', communityId).single(),
      supabase.from('Discussion').select('*').eq('communityId', communityId),
      supabase.from('CommunityMember').select('*').eq('communityId', communityId),
    ]);

    if (communityResult.error) throw communityResult.error;
    if (discussionsResult.error) throw discussionsResult.error;
    if (membersResult.error) throw membersResult.error;

    const discussionIds = discussionsResult.data?.map((d) => d.id) || [];

    let messages: any[] = [];
    if (discussionIds.length > 0) {
      const { data: messagesData, error: messagesError } = await supabase
        .from('DiscussionMessage')
        .select('*')
        .in('discussionId', discussionIds);

      if (messagesError) throw messagesError;
      messages = messagesData || [];
    }

    return {
      data: {
        community: communityResult.data,
        discussions: discussionsResult.data || [],
        messages,
        members: membersResult.data || [],
      },
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function downloadJSON(data: any, filename: string) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// HEALTH CHECKS
// ============================================================================

export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  metrics?: {
    totalCommunities: number;
    totalDiscussions: number;
    totalMessages: number;
    totalMembers: number;
    averageMessagesPerDiscussion: number;
  };
  error?: string;
}> {
  try {
    const [communitiesResult, discussionsResult, messagesResult, membersResult] = await Promise.all([
      supabase.from('Community').select('count', { count: 'exact', head: true }),
      supabase.from('Discussion').select('count', { count: 'exact', head: true }),
      supabase.from('DiscussionMessage').select('count', { count: 'exact', head: true }),
      supabase.from('CommunityMember').select('count', { count: 'exact', head: true }),
    ]);

    const communityCount = communitiesResult.count || 0;
    const discussionCount = discussionsResult.count || 0;
    const messageCount = messagesResult.count || 0;
    const memberCount = membersResult.count || 0;

    const avgMessagesPerDiscussion = discussionCount > 0 ? messageCount / discussionCount : 0;

    return {
      healthy: true,
      metrics: {
        totalCommunities: communityCount,
        totalDiscussions: discussionCount,
        totalMessages: messageCount,
        totalMembers: memberCount,
        averageMessagesPerDiscussion: Math.round(avgMessagesPerDiscussion * 100) / 100,
      },
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function checkRealtimeHealth(): Promise<{
  healthy: boolean;
  subscriptions?: number;
  error?: string;
}> {
  try {
    const { data: channels, error } = await supabase
      .from('pg_stat_replication')
      .select('*')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return {
      healthy: !error || error.code === 'PGRST116',
      subscriptions: channels?.length || 0,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// REPORTING
// ============================================================================

export async function generateSystemReport(): Promise<string> {
  const dbHealth = await checkDatabaseHealth();
  const rtHealth = await checkRealtimeHealth();

  const report = `
# T3 System Report
Generated: ${new Date().toISOString()}

## Database Health
- Status: ${dbHealth.healthy ? '✅ Healthy' : '❌ Unhealthy'}
${dbHealth.error ? `- Error: ${dbHealth.error}` : ''}
${
  dbHealth.metrics
    ? `
- Total Communities: ${dbHealth.metrics.totalCommunities}
- Total Discussions: ${dbHealth.metrics.totalDiscussions}
- Total Messages: ${dbHealth.metrics.totalMessages}
- Total Members: ${dbHealth.metrics.totalMembers}
- Avg Messages/Discussion: ${dbHealth.metrics.averageMessagesPerDiscussion}
`
    : ''
}

## Real-Time Health
- Status: ${rtHealth.healthy ? '✅ Healthy' : '❌ Unhealthy'}
${rtHealth.error ? `- Error: ${rtHealth.error}` : ''}
${rtHealth.subscriptions ? `- Active Subscriptions: ${rtHealth.subscriptions}` : ''}
  `;

  return report;
}

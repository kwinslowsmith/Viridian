import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log('📢 Fetching announcements for org slug:', slug);

    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      console.log('❌ Organization not found for slug:', slug);
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    console.log('✅ Found org:', org.id);

    // First, let's see ALL organization-type isMail conversations regardless of organizationId
    const allOrgAnnouncements = await prisma.conversation.findMany({
      where: {
        type: 'organization',
        isMail: true,
      },
      select: {
        id: true,
        title: true,
        organizationId: true,
        createdAt: true,
      },
    });
    console.log('📊 ALL org announcements in DB:', allOrgAnnouncements);

    // Fetch organization-type conversations (announcements) with their messages
    const announcements = await prisma.conversation.findMany({
      where: {
        organizationId: org.id,
        type: 'organization',
        isMail: true,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, name: true } },
          },
        },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log('📨 Found', announcements.length, 'announcements for org', org.id);
    announcements.forEach(a => {
      console.log('  - Announcement:', a.id, 'type:', a.type, 'isMail:', a.isMail, 'messages:', a.messages.length);
    });

    return NextResponse.json({
      announcements,
      debug: {
        orgSlug: slug,
        orgId: org.id,
        allOrgAnnouncements,
      }
    });
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

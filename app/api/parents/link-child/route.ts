import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

// POST: Create a linking code that a parent can share or that a student can redeem
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { childId, action } = await request.json();

    if (!childId || !action) {
      return NextResponse.json(
        { error: 'childId and action are required' },
        { status: 400 }
      );
    }

    // Validate action
    if (action !== 'create' && action !== 'accept') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Verify that the child exists
    const child = await prisma.user.findUnique({
      where: { id: childId },
      select: { id: true, name: true, email: true },
    });

    if (!child) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      );
    }

    if (action === 'create') {
      // Only parents or admins can create linking codes
      if (user.role !== 'parent' && user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Only parents can create linking codes' },
          { status: 403 }
        );
      }

      // Check if already linked
      const existingLink = await prisma.parentChild.findUnique({
        where: {
          parentId_childId: {
            parentId: user.id,
            childId: childId,
          },
        },
      });

      if (existingLink) {
        return NextResponse.json(
          { error: 'Already linked to this child' },
          { status: 409 }
        );
      }

      // Create the linking code
      const linkingCode = randomBytes(3).toString('hex').toUpperCase(); // 6 characters like "A1B2C3"

      // Store it in a temporary table or cache (using User model for now with a temporary field)
      // In production, use a dedicated LinkingCode table with expiration
      const linkRecord = await prisma.linkingCode.create({
        data: {
          code: linkingCode,
          parentId: user.id,
          childId: childId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      return NextResponse.json({
        success: true,
        linkingCode: linkingCode,
        childName: child.name,
        expiresAt: linkRecord.expiresAt,
        message: `Share this code with ${child.name} to link your parent account`,
      });
    }

    // Accept linking (when child or student enters the code)
    // This would typically be called after verifying the code
    return NextResponse.json(
      { error: 'Not implemented' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error linking parent-child:', error);
    return NextResponse.json(
      { error: 'Failed to link parent and child' },
      { status: 500 }
    );
  }
}

// POST: Accept a linking code
export async function PUT(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Linking code is required' },
        { status: 400 }
      );
    }

    // Find the linking code
    const linkRecord = await prisma.linkingCode.findUnique({
      where: { code },
    });

    if (!linkRecord) {
      return NextResponse.json(
        { error: 'Invalid linking code' },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date() > linkRecord.expiresAt) {
      await prisma.linkingCode.delete({ where: { code } });
      return NextResponse.json(
        { error: 'Linking code has expired' },
        { status: 410 }
      );
    }

    // Check if already linked
    const existingLink = await prisma.parentChild.findUnique({
      where: {
        parentId_childId: {
          parentId: linkRecord.parentId,
          childId: linkRecord.childId,
        },
      },
    });

    if (existingLink) {
      await prisma.linkingCode.delete({ where: { code } });
      return NextResponse.json(
        { error: 'Already linked to this parent' },
        { status: 409 }
      );
    }

    // Create the parent-child relationship
    await prisma.parentChild.create({
      data: {
        parentId: linkRecord.parentId,
        childId: linkRecord.childId,
      },
    });

    // Create default notification preferences
    await prisma.parentNotificationPreference.create({
      data: {
        parentChildId: (
          await prisma.parentChild.findUnique({
            where: {
              parentId_childId: {
                parentId: linkRecord.parentId,
                childId: linkRecord.childId,
              },
            },
          })
        )!.id,
      },
    });

    // Delete the linking code
    await prisma.linkingCode.delete({ where: { code } });

    // Fetch child info for response
    const child = await prisma.user.findUnique({
      where: { id: linkRecord.childId },
      select: { id: true, name: true },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully linked to ${child?.name}`,
      childId: linkRecord.childId,
    });
  } catch (error) {
    console.error('Error accepting linking code:', error);
    return NextResponse.json(
      { error: 'Failed to link parent and child' },
      { status: 500 }
    );
  }
}

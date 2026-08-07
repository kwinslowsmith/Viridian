import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendCelebrationEmail } from '@/lib/email/service';

// Called when a student completes an objective
// Sends celebration emails to all linked parents
export async function POST(request: NextRequest) {
  try {
    const { childId, objectiveId } = await request.json();

    if (!childId || !objectiveId) {
      return NextResponse.json(
        { error: 'childId and objectiveId are required' },
        { status: 400 }
      );
    }

    // Get the objective details
    const objective = await prisma.exampleObjective.findUnique({
      where: { id: objectiveId },
      include: {
        exampleStandard: { select: { id: true, name: true } },
      },
    });

    if (!objective) {
      return NextResponse.json(
        { error: 'Objective not found' },
        { status: 404 }
      );
    }

    // Get the child
    const child = await prisma.user.findUnique({
      where: { id: childId },
      select: { id: true, name: true },
    });

    if (!child) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      );
    }

    // Get the child's current class
    const enrollment = await prisma.k12Enrollment.findFirst({
      where: { userId: childId },
      include: { k12Class: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'No active class enrollment found' },
        { status: 404 }
      );
    }

    // Find all parent-child relationships where celebration emails are enabled
    const parentRelationships = await prisma.parentChild.findMany({
      where: { childId },
      include: {
        parent: { select: { id: true, email: true, name: true } },
        notificationPreferences: true,
      },
    });

    let sentCount = 0;
    const results = [];

    for (const rel of parentRelationships) {
      // Check if parent has celebrations enabled
      if (!rel.notificationPreferences?.enableCelebrations) {
        results.push({
          parentId: rel.parent.id,
          status: 'skipped',
          reason: 'Celebrations disabled',
        });
        continue;
      }

      try {
        const emailResult = await sendCelebrationEmail({
          parentEmail: rel.parent.email,
          parentName: rel.parent.name,
          childName: child.name,
          objective: objective.name,
          standard: objective.exampleStandard?.name || 'Unknown',
          className: enrollment.k12Class.name,
          masteredDate: new Date().toLocaleDateString(),
        });

        if (emailResult.success) {
          // Record sent notification
          await prisma.sentNotification.create({
            data: {
              parentChildId: rel.id,
              type: 'celebration',
              subject: `🎉 ${child.name} Mastered "${objective.name}"!`,
              status: 'sent',
            },
          });

          sentCount++;
          results.push({
            parentId: rel.parent.id,
            status: 'sent',
            email: rel.parent.email,
          });
        } else {
          await prisma.sentNotification.create({
            data: {
              parentChildId: rel.id,
              type: 'celebration',
              subject: `🎉 ${child.name} Mastered "${objective.name}"!`,
              status: 'failed',
              errorMessage: emailResult.error,
            },
          });

          results.push({
            parentId: rel.parent.id,
            status: 'failed',
            error: emailResult.error,
          });
        }
      } catch (error) {
        results.push({
          parentId: rel.parent.id,
          status: 'error',
          error: String(error),
        });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: parentRelationships.length,
        sent: sentCount,
      },
      results,
    });
  } catch (error) {
    console.error('Error in send-celebration endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

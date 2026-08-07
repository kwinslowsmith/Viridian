import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendDigestEmail } from '@/lib/email/service';

// This endpoint is designed to be called by a cron job or scheduled task
// It sends digest emails to parents based on their notification preferences
export async function POST(request: NextRequest) {
  try {
    // Verify authorization - this should only be called by trusted services
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.CRON_SECRET_KEY;

    if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current day and hour
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    const currentHour = now.getHours();

    // Find all notification preferences that should receive digests now
    const preferences = await prisma.parentNotificationPreference.findMany({
      where: {
        enableWeeklyDigest: true,
        // Match based on day of week and hour
        digestDay: dayOfWeek,
        digestHour: currentHour,
      },
      include: {
        parentChild: {
          include: {
            parent: {
              select: { id: true, email: true, name: true },
            },
            child: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    let successCount = 0;
    let failureCount = 0;
    const results = [];

    // Send digest emails for each eligible parent-child pair
    for (const pref of preferences) {
      try {
        const { parent, child } = pref.parentChild;

        // Get the child's class
        const enrollment = await prisma.k12Enrollment.findFirst({
          where: { userId: child.id },
          include: { k12Class: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        });

        if (!enrollment) {
          results.push({
            parentId: parent.id,
            childId: child.id,
            status: 'skipped',
            reason: 'No active class enrollment',
          });
          continue;
        }

        // Fetch digest data
        const digestData = await fetchDigestData(child.id, enrollment.k12Class.id);

        if (!digestData) {
          results.push({
            parentId: parent.id,
            childId: child.id,
            status: 'skipped',
            reason: 'No progress data available',
          });
          continue;
        }

        // Send the email
        const emailResult = await sendDigestEmail({
          parentEmail: parent.email,
          parentName: parent.name,
          childName: child.name,
          className: enrollment.k12Class.name,
          weekStartDate: getWeekStartDate().toLocaleDateString(),
          weekEndDate: new Date().toLocaleDateString(),
          summary: digestData.summary,
          progressByStandard: digestData.progressByStandard,
        });

        if (emailResult.success) {
          // Record sent notification
          await prisma.sentNotification.create({
            data: {
              parentChildId: pref.parentChild.id,
              type: 'digest',
              subject: `Weekly Update: ${child.name}'s Learning Progress`,
              status: 'sent',
            },
          });

          successCount++;
          results.push({
            parentId: parent.id,
            childId: child.id,
            status: 'sent',
            email: parent.email,
          });
        } else {
          // Record failed notification
          await prisma.sentNotification.create({
            data: {
              parentChildId: pref.parentChild.id,
              type: 'digest',
              subject: `Weekly Update: ${child.name}'s Learning Progress`,
              status: 'failed',
              errorMessage: emailResult.error,
            },
          });

          failureCount++;
          results.push({
            parentId: parent.id,
            childId: child.id,
            status: 'failed',
            error: emailResult.error,
          });
        }
      } catch (error) {
        failureCount++;
        results.push({
          childId: pref.parentChild.child.id,
          status: 'error',
          error: String(error),
        });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: preferences.length,
        sent: successCount,
        failed: failureCount,
      },
      results,
    });
  } catch (error) {
    console.error('Error in send-digests endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

// Helper: Get start of current week
function getWeekStartDate(): Date {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day;
  return new Date(today.setDate(diff));
}

// Helper: Fetch digest data for a child
async function fetchDigestData(childId: string, classId: string) {
  try {
    // Get this week's start and end dates
    const weekStart = getWeekStartDate();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Fetch the child's class and its standards
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
      include: {
        standards: {
          include: {
            objectives: true,
          },
        },
      },
    });

    if (!k12Class) return null;

    // Get child's progress for each standard
    const progressByStandard = [];

    for (const standard of k12Class.standards) {
      const progress = await prisma.studentStandardProgress.findUnique({
        where: {
          userId_standardId_organizationId: {
            userId: childId,
            standardId: standard.id,
            organizationId: k12Class.organizationId,
          },
        },
      });

      // Get objectives mastery
      const objProgressList = await prisma.studentObjectiveProgress.findMany({
        where: {
          userId: childId,
          objective: {
            exampleStandardId: standard.id,
          },
        },
      });

      const masteredCount = objProgressList.filter((o) => o.completed).length;
      const totalCount = standard.objectives.length;
      const currentMastery =
        totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

      const previousMastery = progress?.level ? progress.level * 25 : 0;
      const change = currentMastery - previousMastery;

      progressByStandard.push({
        standard: standard.name,
        previousMastery: previousMastery,
        currentMastery: currentMastery,
        change: change,
        status: change > 0 ? 'improved' : change < 0 ? 'declined' : 'stable',
      });
    }

    // Get summary statistics
    const totalSubmissions = await prisma.submission.count({
      where: {
        studentId: childId,
        createdAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    // Get mastered and struggling objectives
    const allObjectives = await prisma.exampleObjective.findMany({
      where: {
        exampleStandardId: {
          in: k12Class.standards.map((s) => s.id),
        },
      },
    });

    const masteredObjectives = [];
    const newObjectivesStarted = [];
    const objectivesNeedingSupport = [];

    for (const objective of allObjectives) {
      const objProgress = await prisma.studentObjectiveProgress.findUnique({
        where: {
          userId_objectiveId: {
            userId: childId,
            objectiveId: objective.id,
          },
        },
      });

      if (objProgress?.completed) {
        masteredObjectives.push({
          standard:
            k12Class.standards.find((s) => s.id === objective.exampleStandardId)?.name ||
            'Unknown',
          objective: objective.name,
        });
      } else if (objProgress) {
        // In progress
        newObjectivesStarted.push({
          standard:
            k12Class.standards.find((s) => s.id === objective.exampleStandardId)?.name ||
            'Unknown',
          objective: objective.name,
        });
      } else {
        // Not started - check mastery on standard
        const stdProgress = progressByStandard.find(
          (p) => p.standard === k12Class.standards.find((s) => s.id === objective.exampleStandardId)?.name
        );
        if (stdProgress && stdProgress.currentMastery < 60) {
          objectivesNeedingSupport.push({
            standard:
              k12Class.standards.find((s) => s.id === objective.exampleStandardId)?.name ||
              'Unknown',
            objective: objective.name,
            currentMastery: stdProgress.currentMastery,
          });
        }
      }
    }

    return {
      summary: {
        totalSubmissions,
        masteredObjectives,
        newObjectivesStarted,
        objectivesNeedingSupport,
      },
      progressByStandard,
    };
  } catch (error) {
    console.error('Error fetching digest data:', error);
    return null;
  }
}

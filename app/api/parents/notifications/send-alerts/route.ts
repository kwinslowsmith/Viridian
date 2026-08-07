import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAlertEmail } from '@/lib/email/service';

// Called periodically to send alert emails to parents
// Sends alerts when a child's mastery falls below the threshold
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.CRON_SECRET_KEY;

    if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all parent-child relationships where alerts are enabled
    const preferences = await prisma.parentNotificationPreference.findMany({
      where: { enableAlerts: true },
      include: {
        parentChild: {
          include: {
            parent: { select: { id: true, email: true, name: true } },
            child: { select: { id: true, name: true } },
          },
        },
      },
    });

    let sentCount = 0;
    const results = [];

    for (const pref of preferences) {
      try {
        const { parent, child } = pref.parentChild;

        // Check if an alert was recently sent (within minDaysBetweenAlerts)
        const daysSinceLastAlert = pref.minDaysBetweenAlerts || 7;
        const lastAlertDate = new Date();
        lastAlertDate.setDate(lastAlertDate.getDate() - daysSinceLastAlert);

        const recentAlert = await prisma.sentNotification.findFirst({
          where: {
            parentChildId: pref.parentChild.id,
            type: 'alert',
            sentAt: { gte: lastAlertDate },
          },
        });

        if (recentAlert) {
          results.push({
            parentId: parent.id,
            childId: child.id,
            status: 'skipped',
            reason: `Alert already sent ${daysSinceLastAlert} days ago`,
          });
          continue;
        }

        // Get child's current class
        const enrollment = await prisma.k12Enrollment.findFirst({
          where: { userId: child.id },
          include: {
            k12Class: {
              include: {
                standards: {
                  include: { objectives: true },
                },
              },
            },
          },
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

        // Check for objectives below threshold
        const objectivesNeedingSupport = [];
        const threshold = pref.alertThreshold || 60;

        for (const standard of enrollment.k12Class.standards) {
          // Get mastery % for this standard
          const objProgressList = await prisma.studentObjectiveProgress.findMany({
            where: {
              userId: child.id,
              objective: {
                exampleStandardId: standard.id,
              },
            },
          });

          const masteredCount = objProgressList.filter((o) => o.completed).length;
          const totalCount = standard.objectives.length;
          const masteryPercent =
            totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

          // If below threshold, add all non-mastered objectives
          if (masteryPercent < threshold) {
            const nonMasteredObjectives = standard.objectives.filter(
              (obj) =>
                !objProgressList.find(
                  (p) => p.objectiveId === obj.id && p.completed
                )
            );

            for (const obj of nonMasteredObjectives) {
              objectivesNeedingSupport.push({
                standard: standard.name,
                objective: obj.name,
                currentMastery: masteryPercent,
              });
            }
          }
        }

        // If there are objectives needing support, send alert
        if (objectivesNeedingSupport.length > 0) {
          const emailResult = await sendAlertEmail({
            parentEmail: parent.email,
            parentName: parent.name,
            childName: child.name,
            className: enrollment.k12Class.name,
            threshold: threshold,
            objectivesNeedingSupport,
          });

          if (emailResult.success) {
            // Record sent notification
            await prisma.sentNotification.create({
              data: {
                parentChildId: pref.parentChild.id,
                type: 'alert',
                subject: `${child.name} needs support in ${enrollment.k12Class.name}`,
                status: 'sent',
              },
            });

            sentCount++;
            results.push({
              parentId: parent.id,
              childId: child.id,
              status: 'sent',
              email: parent.email,
              objectivesNeedingSupport: objectivesNeedingSupport.length,
            });
          } else {
            await prisma.sentNotification.create({
              data: {
                parentChildId: pref.parentChild.id,
                type: 'alert',
                subject: `${child.name} needs support in ${enrollment.k12Class.name}`,
                status: 'failed',
                errorMessage: emailResult.error,
              },
            });

            results.push({
              parentId: parent.id,
              childId: child.id,
              status: 'failed',
              error: emailResult.error,
            });
          }
        } else {
          results.push({
            parentId: parent.id,
            childId: child.id,
            status: 'skipped',
            reason: 'No objectives below threshold',
          });
        }
      } catch (error) {
        results.push({
          status: 'error',
          error: String(error),
        });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: preferences.length,
        sent: sentCount,
      },
      results,
    });
  } catch (error) {
    console.error('Error in send-alerts endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

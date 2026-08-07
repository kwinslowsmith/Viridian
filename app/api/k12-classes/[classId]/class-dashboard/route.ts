import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId } = await params;

    // Verify user is the instructor for this class
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
      include: {
        enrollments: true,
        instructor: { select: { name: true } },
      },
    });

    if (!k12Class || k12Class.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const classSize = k12Class.enrollments.length;
    const studentIds = k12Class.enrollments.map(e => e.studentId);

    // Get all standards that might be assigned to this class
    // For now, get all standards from the organization
    const standards = await prisma.standard.findMany({
      where: {
        organizationId: k12Class.organizationId,
        type: 'content', // Content standards, not skills
      },
    });

    // Get student progress for these standards
    const studentProgress = await prisma.studentStandardProgress.findMany({
      where: {
        organizationId: k12Class.organizationId,
        userId: { in: studentIds },
        standardId: { in: standards.map(s => s.id) },
      },
      include: {
        standard: true,
      },
    });

    // Calculate mastery stats per standard
    const standardStats = standards.map(standard => {
      const progressForStandard = studentProgress.filter(
        sp => sp.standardId === standard.id
      );

      // Count students with >= passPercentage as mastered
      const masteredCount = progressForStandard.filter(sp => {
        // For content standards, check completed status or level
        return sp.completed || (sp.level && sp.level >= 3);
      }).length;

      const mastery = classSize > 0 ? Math.round((masteredCount / classSize) * 100) : 0;
      const strugglingCount = classSize - masteredCount;
      const strugglingPercent =
        classSize > 0 ? Math.round((strugglingCount / classSize) * 100) : 0;

      return {
        standardId: standard.id,
        standardName: standard.name,
        standardCode: standard.code,
        classMasteryPercent: mastery,
        masteredStudents: masteredCount,
        totalStudents: classSize,
        strugglingStudents: strugglingCount,
        strugglingPercent,
        isStrugglingSkill: strugglingPercent > 40, // More than 40% struggling
      };
    });

    // Sort by struggling percentage (most struggling first)
    const sortedStandards = standardStats.sort(
      (a, b) => b.strugglingPercent - a.strugglingPercent
    );

    // Get top 3 struggling skills
    const strugglingSkills = sortedStandards
      .filter(s => s.isStrugglingSkill)
      .slice(0, 3)
      .map(s => ({
        skillLabel: s.standardName,
        studentCount: s.strugglingStudents,
        mastery: s.classMasteryPercent,
      }));

    // Count students needing support (< 60% mastery on any standard)
    const studentsNeedingSupport = new Set<string>();
    studentIds.forEach(studentId => {
      const studentStandards = studentProgress.filter(
        sp => sp.userId === studentId
      );
      const avg =
        studentStandards.length > 0
          ? Math.round(
              studentStandards.reduce((sum, sp) => {
                const mastery = sp.completed ? 100 : sp.level ? sp.level * 25 : 0;
                return sum + mastery;
              }, 0) / studentStandards.length
            )
          : 0;

      if (avg < 60) {
        studentsNeedingSupport.add(studentId);
      }
    });

    // Calculate class trend (for now, returning 0 as we don't have historical data)
    // In a real implementation, you'd compare to previous week's data
    const classTrendPercent = 0;
    const classOverallMastery =
      standardStats.length > 0
        ? Math.round(
            standardStats.reduce((sum, s) => sum + s.classMasteryPercent, 0) /
              standardStats.length
          )
        : 0;

    return NextResponse.json({
      className: k12Class.name,
      classSize,
      classOverallMastery,
      standards: sortedStandards,
      strugglingSkills,
      studentsNeedingSupportCount: studentsNeedingSupport.size,
      classTrendPercent,
      studentsNeedingSupportPercent: Math.round(
        (studentsNeedingSupport.size / classSize) * 100
      ),
    });
  } catch (error) {
    console.error('Failed to fetch class dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class dashboard' },
      { status: 500 }
    );
  }
}

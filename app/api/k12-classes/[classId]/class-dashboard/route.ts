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
    if (!classId || typeof classId !== 'string' || classId.trim() === '') {
      return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 });
    }

    // Verify user is the instructor for this class
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        name: true,
        organizationId: true,
        instructorId: true,
        enrollments: { select: { studentId: true } },
      },
    });

    if (!k12Class || k12Class.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const classSize = k12Class.enrollments.length;
    const studentIds = k12Class.enrollments.map(e => e.studentId);

    if (classSize === 0) {
      return NextResponse.json({
        className: k12Class.name,
        classSize: 0,
        classOverallMastery: 0,
        standards: [],
        strugglingSkills: [],
        studentsNeedingSupportCount: 0,
        classTrendPercent: 0,
        studentsNeedingSupportPercent: 0,
      });
    }

    // Get all standards from the organization
    const standards = await prisma.standard.findMany({
      where: {
        organizationId: k12Class.organizationId,
        type: 'content', // Content standards, not skills
      },
      take: 100, // Pagination limit
    });

    if (standards.length === 0) {
      return NextResponse.json({
        className: k12Class.name,
        classSize,
        classOverallMastery: 0,
        standards: [],
        strugglingSkills: [],
        studentsNeedingSupportCount: 0,
        classTrendPercent: 0,
        studentsNeedingSupportPercent: 0,
      });
    }

    const standardIds = standards.map(s => s.id);

    // Get student progress for these standards
    const studentProgress = await prisma.studentStandardProgress.findMany({
      where: {
        organizationId: k12Class.organizationId,
        userId: { in: studentIds },
        standardId: { in: standardIds },
      },
    });

    // Index by standardId for efficient lookup
    const progressByStandard: Record<string, typeof studentProgress> = {};
    const progressByStudent: Record<string, typeof studentProgress> = {};

    studentProgress.forEach(sp => {
      if (!progressByStandard[sp.standardId]) {
        progressByStandard[sp.standardId] = [];
      }
      progressByStandard[sp.standardId].push(sp);

      if (!progressByStudent[sp.userId]) {
        progressByStudent[sp.userId] = [];
      }
      progressByStudent[sp.userId].push(sp);
    });

    // Calculate mastery stats per standard
    const standardStats = standards.map(standard => {
      const progressForStandard = progressByStandard[standard.id] || [];

      // Count students with >= passPercentage as mastered
      const masteredCount = progressForStandard.filter(sp => {
        // For content standards, check completed status or level (3+ is mastered)
        return sp.completed || (sp.level && sp.level >= 3);
      }).length;

      const mastery = Math.round((masteredCount / classSize) * 100);
      const strugglingCount = classSize - masteredCount;
      const strugglingPercent = Math.round((strugglingCount / classSize) * 100);

      return {
        standardId: standard.id,
        standardName: standard.name,
        standardCode: standard.code,
        classMasteryPercent: mastery,
        masteredStudents: masteredCount,
        totalStudents: classSize,
        strugglingStudents: strugglingCount,
        strugglingPercent,
        isStrugglingSkill: strugglingPercent > 40,
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

    // Count students needing support (< 60% mastery overall)
    const studentsNeedingSupport = new Set<string>();
    studentIds.forEach(studentId => {
      const studentStandards = progressByStudent[studentId] || [];
      if (studentStandards.length === 0) {
        studentsNeedingSupport.add(studentId);
      } else {
        const avg = Math.round(
          studentStandards.reduce((sum, sp) => {
            const mastery = sp.completed ? 100 : sp.level ? Math.min(sp.level * 25, 100) : 0;
            return sum + mastery;
          }, 0) / studentStandards.length
        );
        if (avg < 60) {
          studentsNeedingSupport.add(studentId);
        }
      }
    });

    // Calculate class overall mastery
    const classOverallMastery = standardStats.length > 0
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
      classTrendPercent: 0, // TODO: Compare to previous week's data for trend
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

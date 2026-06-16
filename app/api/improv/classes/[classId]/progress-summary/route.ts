import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET class progress summary (heatmap)
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

    // Verify user is instructor of this class
    const improvClass = await prisma.improvClass.findUnique({
      where: { id: classId },
      include: {
        instructor: { select: { id: true, name: true } },
      },
    });

    if (!improvClass || improvClass.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the instructor can view class progress' },
        { status: 403 }
      );
    }

    // Get all students enrolled
    const enrollments = await prisma.improvEnrollment.findMany({
      where: { classId, status: 'active' },
      include: { student: { select: { id: true, name: true } } },
      orderBy: { student: { name: 'asc' } },
    });

    // Get all skills
    const skills = await prisma.improvSkill.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    // Get all assessments for this class
    const assessments = await prisma.improvSkillAssessment.findMany({
      where: { classId },
    });

    // Build heatmap: students × skills
    const matrix = enrollments.map(enrollment => {
      const studentAssessments = assessments.filter(a => a.studentId === enrollment.studentId);
      return {
        studentId: enrollment.studentId,
        studentName: enrollment.student.name,
        levels: skills.map(skill => {
          const assessment = studentAssessments.find(a => a.skillId === skill.id);
          return {
            skillId: skill.id,
            skillName: skill.name,
            level: assessment?.teacherLevel || assessment?.studentSelfLevel || null,
            confirmed: !!assessment?.teacherLevel,
          };
        }),
      };
    });

    return NextResponse.json({
      class: {
        id: improvClass.id,
        name: improvClass.name,
        instructor: improvClass.instructor,
      },
      skills: skills.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
      })),
      students: matrix,
      summary: {
        totalStudents: enrollments.length,
        totalSkills: skills.length,
        totalRatings: assessments.length,
        confirmedRatings: assessments.filter(a => !!a.teacherLevel).length,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch progress summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress summary' },
      { status: 500 }
    );
  }
}

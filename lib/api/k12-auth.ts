import { prisma } from '@/lib/prisma';

/**
 * Authorization checks for K12 API endpoints
 * Follows visibility-first pattern: verify access before returning data
 */

export async function verifyStudentInClass(
  userId: string,
  classId: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const enrollment = await prisma.k12Enrollment.findUnique({
      where: {
        classId_studentId: {
          classId,
          studentId: userId,
        },
      },
    });

    if (!enrollment) {
      return {
        valid: false,
        error: 'Student not enrolled in this class',
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Authorization check failed',
    };
  }
}

export async function verifyTeacherOwnsClass(
  userId: string,
  classId: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: { instructorId: true },
    });

    if (!k12Class) {
      return {
        valid: false,
        error: 'Class not found',
      };
    }

    if (k12Class.instructorId !== userId) {
      return {
        valid: false,
        error: 'Not authorized to view this class',
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Authorization check failed',
    };
  }
}

export async function verifyParentChildRelationship(
  parentId: string,
  childId: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const relationship = await prisma.parentChild.findUnique({
      where: {
        parentId_childId: {
          parentId,
          childId,
        },
      },
    });

    if (!relationship) {
      return {
        valid: false,
        error: 'Not authorized to view this child\'s progress',
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Authorization check failed',
    };
  }
}

export async function verifyStudentCanAccessAssessment(
  studentId: string,
  assessmentId: string
): Promise<{ valid: boolean; classId?: string; error?: string }> {
  try {
    const assessment = await prisma.k12Assessment.findUnique({
      where: { id: assessmentId },
      select: { classId: true },
    });

    if (!assessment) {
      return {
        valid: false,
        error: 'Assessment not found',
      };
    }

    const enrollment = await prisma.k12Enrollment.findUnique({
      where: {
        classId_studentId: {
          classId: assessment.classId,
          studentId,
        },
      },
    });

    if (!enrollment) {
      return {
        valid: false,
        error: 'Student not enrolled in this class',
      };
    }

    return { valid: true, classId: assessment.classId };
  } catch (error) {
    return {
      valid: false,
      error: 'Authorization check failed',
    };
  }
}

export async function verifyTeacherCanGrade(
  teacherId: string,
  assessmentId: string
): Promise<{ valid: boolean; classId?: string; error?: string }> {
  try {
    const assessment = await prisma.k12Assessment.findUnique({
      where: { id: assessmentId },
      include: {
        class: {
          select: { instructorId: true },
        },
      },
    });

    if (!assessment) {
      return {
        valid: false,
        error: 'Assessment not found',
      };
    }

    if (assessment.class.instructorId !== teacherId) {
      return {
        valid: false,
        error: 'Not authorized to grade this assessment',
      };
    }

    return { valid: true, classId: assessment.classId };
  } catch (error) {
    return {
      valid: false,
      error: 'Authorization check failed',
    };
  }
}

/**
 * Visibility-first pattern: Check data visibility before returning
 * Returns true if data should be visible to the user
 */
export function isDataVisible(
  visibility: string,
  userRole: 'student' | 'teacher' | 'parent' | 'admin',
  ownerOrganizationId: string,
  userOrganizationId?: string
): boolean {
  if (visibility === 'private') {
    // Only owner can see private data
    return false;
  }

  if (visibility === 'organization') {
    // Users in same org can see
    return userOrganizationId === ownerOrganizationId;
  }

  if (visibility === 'public') {
    // Everyone can see
    return true;
  }

  // Default deny
  return false;
}

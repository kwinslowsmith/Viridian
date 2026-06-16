import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { matchCharterSeedData } from '@/lib/match-charter-seed';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting seed...');
    console.log('Prisma:', prisma);
    // TODO: Add auth check for SuperAdmin only
    const orgData = matchCharterSeedData.organization;
    const departments = matchCharterSeedData.departments;
    const courses = matchCharterSeedData.courses;

    console.log('About to find organization...');
    // Create or get organization
    let org = await prisma.organization.findUnique({
      where: { slug: orgData.slug },
    });
    console.log('Organization found or will be created:', org?.id);

    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: orgData.name,
          slug: orgData.slug,
          description: orgData.description,
          topic: orgData.topic,
          isPublic: orgData.isPublic,
        },
      });
    }

    // Create departments with resource libraries
    const deptMap: Record<string, any> = {};
    for (const dept of departments) {
      const deptUnit = await prisma.organizationalUnit.create({
        data: {
          organizationId: org.id,
          name: dept.name,
          description: dept.description,
          type: dept.type,
          visibility: 'public',
          accessLevel: 'admin-assigned',
        },
      });

      // Create resource library for this department
      const library = await prisma.resourceLibrary.create({
        data: {
          organizationId: org.id,
          name: `${dept.name} Resource Library`,
          description: `Resources for ${dept.name}`,
          organizationalUnitId: deptUnit.id,
        },
      });

      deptMap[dept.name] = { unit: deptUnit, library };
    }

    // Create courses and standards
    for (const course of courses) {
      const dept = deptMap[course.department];
      if (!dept) {
        console.warn(`Department not found: ${course.department}`);
        continue;
      }

      // Create K12Class
      const k12Class = await prisma.k12Class.create({
        data: {
          organizationId: org.id,
          name: course.name,
          code: course.code,
          gradeLevel: course.gradeLevel,
          description: `${course.name} - Grade ${course.gradeLevel}`,
          isMainCourse: true,
          rubricScale: 3,
        },
      });

      // Create skill standards
      for (const skillStd of course.skillStandards) {
        const standard = await prisma.standard.create({
          data: {
            organizationId: org.id,
            code: skillStd.code,
            name: skillStd.name,
            description: skillStd.description,
            type: 'skill',
            passPercentage: 80,
          },
        });

        // Create objectives for this skill standard
        let sequenceNum = 1;
        for (const obj of skillStd.objectives) {
          await prisma.exampleObjective.create({
            data: {
              standardId: standard.id,
              label: obj.label,
              text: obj.text,
              description: obj.description,
              sequenceNum: sequenceNum++,
            },
          });
        }

        // Link standard to class
        await prisma.classStandard.create({
          data: {
            classId: k12Class.id,
            standardId: standard.id,
          },
        });
      }

      // Create content standards
      for (const contentStd of course.contentStandards) {
        const standard = await prisma.standard.create({
          data: {
            organizationId: org.id,
            code: contentStd.code,
            name: contentStd.name,
            description: contentStd.description,
            type: 'content',
            passPercentage: 80,
          },
        });

        // Create objectives for this content standard
        let sequenceNum = 1;
        for (const obj of contentStd.objectives) {
          await prisma.exampleObjective.create({
            data: {
              standardId: standard.id,
              label: obj.label,
              text: obj.text,
              description: obj.description,
              sequenceNum: sequenceNum++,
            },
          });
        }

        // Link standard to class
        await prisma.classStandard.create({
          data: {
            classId: k12Class.id,
            standardId: standard.id,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Match Charter High School seeded successfully',
      orgId: org.id,
      orgSlug: org.slug,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

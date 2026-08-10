import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testLitClass() {
  console.log('\n🧪 Testing American Literature Class (Full Seed Data)\n');
  
  // Get the American Literature class
  const k12Class = await prisma.k12Class.findFirst({
    where: { name: { contains: 'American Literature' } },
    include: {
      instructor: { select: { id: true, name: true } },
      enrollments: { select: { id: true, studentId: true } }
    }
  });
  
  if (!k12Class) {
    console.log('❌ American Literature class not found');
    return;
  }
  
  const classId = k12Class.id;
  console.log(`✅ Found class: ${k12Class.name}`);
  console.log(`   ID: ${classId}`);
  console.log(`   Instructor: ${k12Class.instructor.name}`);
  console.log(`   Enrolled students: ${k12Class.enrollments.length}\n`);
  
  // Get standards
  const classStandards = await prisma.classStandard.findMany({
    where: { classId },
    include: {
      standard: {
        include: { exampleObjectives: { orderBy: { sequenceNum: 'asc' } } }
      }
    }
  });
  
  console.log(`✅ Class standards: ${classStandards.length}`);
  classStandards.forEach(cs => {
    console.log(`   📚 ${cs.standard.name}`);
    console.log(`      Objectives: ${cs.standard.exampleObjectives.length}`);
  });
  console.log();
  
  // Get submissions
  const submissions = await prisma.k12Submission.findMany({
    where: { enrollment: { classId } }
  });
  
  console.log(`✅ Submissions: ${submissions.length}`);
  if (submissions.length > 0) {
    console.log('   Sample grades:', submissions.slice(0, 5).map(s => s.grade).join(', '));
  }
  console.log();
  
  // Get intervention groups
  const interventionGroups = await prisma.interventionGroup.findMany({
    where: { classId },
    include: { students: { select: { id: true } } }
  });
  
  console.log(`✅ Intervention groups: ${interventionGroups.length}`);
  interventionGroups.forEach(ig => {
    console.log(`   🎯 ${ig.name} (${ig.students.length} students)`);
  });
  console.log();
  
  // Return class ID for testing
  console.log(`\n📋 Use this classId for dashboard testing:`);
  console.log(`   ${classId}\n`);
}

testLitClass().finally(() => prisma.$disconnect());

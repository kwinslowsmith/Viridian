import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDashboardAPI() {
  console.log('\n🧪 Testing Teacher Class Dashboard API Logic\n');
  
  const classId = 'cmqqvcwrj000gd4tjleg8vlpt';
  
  // Get class details
  const k12Class = await prisma.k12Class.findUnique({
    where: { id: classId },
    include: {
      instructor: { select: { id: true, name: true } },
      enrollments: { select: { id: true, studentId: true } }
    }
  });
  
  if (!k12Class) {
    console.log('❌ Class not found');
    return;
  }
  
  console.log(`✅ Found class: ${k12Class.name}`);
  console.log(`   Instructor: ${k12Class.instructor.name}`);
  console.log(`   Enrolled students: ${k12Class.enrollments.length}\n`);
  
  // Get standards and objectives for the class
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
    console.log(`   - ${cs.standard.name} (${cs.standard.exampleObjectives.length} objectives)`);
  });
  console.log();
  
  // Get submissions for this class
  const submissions = await prisma.k12Submission.findMany({
    where: {
      enrollment: { classId }
    },
    include: {
      enrollment: { select: { studentId: true } },
      assessment: { select: { standardId: true, objectiveIds: true } }
    },
    take: 10
  });
  
  console.log(`✅ Submissions in class: ${submissions.length} (showing first 10)`);
  submissions.forEach(sub => {
    console.log(`   - Grade: ${sub.grade}%, Status: ${sub.status}`);
  });
  console.log();
  
  // Get intervention groups
  const interventionGroups = await prisma.interventionGroup.findMany({
    where: { classId },
    include: {
      objective: { select: { text: true } },
      students: { select: { id: true } }
    }
  });
  
  console.log(`✅ Intervention groups: ${interventionGroups.length}`);
  interventionGroups.forEach(ig => {
    console.log(`   - ${ig.name}: ${ig.students.length} students`);
    console.log(`     Objective: ${ig.objective.text}`);
  });
  console.log();
  
  // Get school assessments (master calendar)
  const org = await prisma.organization.findUnique({
    where: { id: k12Class.organizationId }
  });
  
  const schoolAssessments = await prisma.schoolAssessment.findMany({
    where: { organizationId: k12Class.organizationId },
    orderBy: { assessmentDate: 'asc' },
    take: 5
  });
  
  console.log(`✅ School-wide assessments: ${schoolAssessments.length}`);
  schoolAssessments.forEach(sa => {
    console.log(`   - ${sa.name} (${sa.assessmentDate.toISOString().split('T')[0]})`);
  });
  console.log();
  
  // Get class assessments
  const classAssessments = await prisma.k12Assessment.findMany({
    where: { classId },
    take: 5
  });
  
  console.log(`✅ Class assessments: ${classAssessments.length}`);
  classAssessments.forEach(ca => {
    const dueStr = ca.dueDate ? ca.dueDate.toISOString().split('T')[0] : 'Not set';
    console.log(`   - ${ca.title} (Due: ${dueStr})`);
  });
  
  console.log('\n✅ Dashboard API logic verification complete!\n');
}

testDashboardAPI().finally(() => prisma.$disconnect());

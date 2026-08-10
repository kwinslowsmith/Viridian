import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDashboardAPI() {
  console.log('\n🧪 Testing Teacher Class Dashboard API Logic (Class 2)\n');
  
  const classId = 'cmqqvcz76001wd4tjeqlxt8j4';
  
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
  
  // Get all classes to see what was seeded
  const allClasses = await prisma.k12Class.findMany({
    select: { id: true, name: true }
  });
  
  console.log(`📊 All K12 Classes in database: ${allClasses.length}`);
  allClasses.forEach(c => console.log(`   - ${c.name}`));
}

testDashboardAPI().finally(() => prisma.$disconnect());

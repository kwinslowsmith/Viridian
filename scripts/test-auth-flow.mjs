import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAuthFlow() {
  console.log('\n🔐 PHASE 1: AUTHENTICATION SETUP TESTING\n');
  console.log('═'.repeat(70) + '\n');
  
  // Get test users from seeded data
  const teacher = await prisma.user.findFirst({
    where: { email: 'teacher1@riverside.edu' },
    select: { id: true, email: true, name: true, role: true }
  });
  
  const student = await prisma.user.findFirst({
    where: { email: 'student1@riverside.edu' },
    select: { id: true, email: true, name: true, role: true }
  });
  
  const parent = await prisma.user.findFirst({
    where: { role: 'parent' },
    select: { id: true, email: true, name: true, role: true },
    take: 1
  });
  
  console.log('✅ TEST USERS FOUND:\n');
  
  if (teacher) {
    console.log(`📚 TEACHER:`);
    console.log(`   Email: ${teacher.email}`);
    console.log(`   Name: ${teacher.name}`);
    console.log(`   Role: ${teacher.role}`);
    console.log(`   ID: ${teacher.id}\n`);
  } else {
    console.log(`❌ Teacher user not found\n`);
  }
  
  if (student) {
    console.log(`👨‍🎓 STUDENT:`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Name: ${student.name}`);
    console.log(`   Role: ${student.role}`);
    console.log(`   ID: ${student.id}\n`);
  } else {
    console.log(`❌ Student user not found\n`);
  }
  
  if (parent) {
    console.log(`👨‍👧 PARENT:`);
    console.log(`   Email: ${parent.email}`);
    console.log(`   Name: ${parent.name}`);
    console.log(`   Role: ${parent.role}`);
    console.log(`   ID: ${parent.id}\n`);
  } else {
    console.log(`❌ Parent user not found\n`);
  }
  
  // Get teacher's classes
  if (teacher) {
    const teacherClasses = await prisma.k12Class.findMany({
      where: { instructorId: teacher.id },
      select: { id: true, name: true, enrollments: { select: { id: true } } }
    });
    
    console.log(`📚 TEACHER'S CLASSES:\n`);
    teacherClasses.forEach(cls => {
      console.log(`   - ${cls.name}`);
      console.log(`     ID: ${cls.id}`);
      console.log(`     Students: ${cls.enrollments.length}\n`);
    });
  }
  
  // Get student's enrollment
  if (student) {
    const enrollment = await prisma.k12Enrollment.findFirst({
      where: { studentId: student.id },
      include: { class: { select: { id: true, name: true } } }
    });
    
    if (enrollment) {
      console.log(`✅ STUDENT'S ENROLLMENT:\n`);
      console.log(`   Class: ${enrollment.class.name}`);
      console.log(`   Class ID: ${enrollment.class.id}\n`);
    }
  }
  
  console.log('═'.repeat(70));
  console.log('\n✅ AUTHENTICATION SETUP VERIFICATION COMPLETE\n');
  console.log('📋 TEST CREDENTIALS:\n');
  console.log(`   Teacher Email: ${teacher?.email}`);
  console.log(`   Student Email: ${student?.email}`);
  console.log(`   Parent Email: ${parent?.email}\n`);
  console.log('📋 NEXT STEPS FOR E2E TESTING:');
  console.log('   1. Visit http://localhost:3000/auth/login');
  console.log('   2. Use test credentials to login');
  console.log('   3. Verify redirects to dashboard');
  console.log('   4. Check API calls succeed with authenticated session\n');
}

testAuthFlow().catch(console.error).finally(() => prisma.$disconnect());

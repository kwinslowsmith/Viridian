import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupTestCredentials() {
  console.log('\n🔑 SETTING UP TEST CREDENTIALS\n');
  console.log('═'.repeat(70) + '\n');
  
  const testPassword = 'TestPassword123!';
  const hashedPassword = await bcrypt.hash(testPassword, 10);
  
  // Set password for teacher
  const teacher = await prisma.user.update({
    where: { email: 'teacher1@riverside.edu' },
    data: { passwordHash: hashedPassword },
    select: { email: true, name: true }
  });
  
  // Set password for student
  const student = await prisma.user.update({
    where: { email: 'student1@riverside.edu' },
    data: { passwordHash: hashedPassword },
    select: { email: true, name: true }
  });
  
  // Set password for parent
  const parent = await prisma.user.update({
    where: { email: 'parent0@example.com' },
    data: { passwordHash: hashedPassword },
    select: { email: true, name: true }
  });
  
  console.log('✅ TEST CREDENTIALS SET:\n');
  console.log(`📚 TEACHER:\n   Email: ${teacher.email}\n   Password: ${testPassword}\n`);
  console.log(`👨‍🎓 STUDENT:\n   Email: ${student.email}\n   Password: ${testPassword}\n`);
  console.log(`👨‍👧 PARENT:\n   Email: ${parent.email}\n   Password: ${testPassword}\n`);
  
  console.log('═'.repeat(70));
  console.log('\n✅ TEST CREDENTIALS READY FOR LOGIN\n');
  console.log('🎯 READY FOR E2E TESTING\n');
}

setupTestCredentials().catch(console.error).finally(() => prisma.$disconnect());

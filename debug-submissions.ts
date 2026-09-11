import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  try {
    // Find the class
    const k12Class = await prisma.k12Class.findFirst({
      where: { name: 'Demo Literature - Period 3' },
    });

    console.log('Class ID:', k12Class?.id);

    if (k12Class) {
      // Find submissions for this class
      const submissions = await prisma.k12Submission.findMany({
        where: {
          assessment: {
            classId: k12Class.id,
          },
        },
        include: {
          assessment: true,
          enrollment: {
            include: {
              student: true,
            },
          },
        },
      });

      console.log('Total submissions found:', submissions.length);
      if (submissions.length > 0) {
        console.log('\nFirst submission:');
        console.log(JSON.stringify(submissions[0], null, 2));
      } else {
        console.log('No submissions found!');

        // Debug: check if assessments exist
        const assessments = await prisma.k12Assessment.findMany({
          where: { classId: k12Class.id },
        });
        console.log('\nAssessments for class:', assessments.length);
        assessments.forEach(a => console.log(`  - ${a.title}`));
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
})();

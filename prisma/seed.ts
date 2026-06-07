import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.improvFeedback.deleteMany();
  await prisma.improvTeacherRating.deleteMany();
  await prisma.improvStudentRating.deleteMany();
  await prisma.improvWeekSkill.deleteMany();
  await prisma.improvObjective.deleteMany();
  await prisma.improvWeek.deleteMany();
  await prisma.improvEnrollment.deleteMany();
  await prisma.improvClass.deleteMany();
  await prisma.improvSkill.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const kyle = await prisma.user.create({
    data: {
      email: 'kyle@example.com',
      name: 'Kyle Winslow Smith',
      role: 'instructor',
    },
  });

  const student1 = await prisma.user.create({
    data: {
      email: 'maya@example.com',
      name: 'Maya Chen',
      role: 'student',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'jordan@example.com',
      name: 'Jordan Lee',
      role: 'student',
    },
  });

  const student3 = await prisma.user.create({
    data: {
      email: 'alex@example.com',
      name: 'Alex Rodriguez',
      role: 'student',
    },
  });

  console.log('✓ Created users');

  // Define 11 improv skills (from improv-tracker.jsx)
  const skillsData = [
    // Foundation Skills (◆)
    {
      slug: 'yes-and',
      name: 'Yes And',
      category: 'foundation',
      categoryIcon: '◆',
      categoryColor: '#D97706',
      description: 'Accepting your partner\'s reality and building on their offers',
      levelDefinitions: JSON.stringify({
        approaching: 'Occasionally accepts offers but struggles with adding value',
        developing: 'Consistently accepts and adds to offers, but ideas are sometimes disconnected',
        proficient: 'Expertly accepts offers and adds meaningful, connected ideas',
      }),
    },
    {
      slug: 'listening',
      name: 'Listening',
      category: 'foundation',
      categoryIcon: '◆',
      categoryColor: '#D97706',
      description: 'Actively hearing and responding to what your partner says and does',
      levelDefinitions: JSON.stringify({
        approaching: 'Focuses primarily on own ideas; limited response to partner input',
        developing: 'Listens to partner but responses are sometimes delayed or disconnected',
        proficient: 'Fully present and responsive; builds naturally on partner\'s contributions',
      }),
    },
    {
      slug: 'specificity',
      name: 'Specificity',
      category: 'foundation',
      categoryIcon: '◆',
      categoryColor: '#D97706',
      description: 'Adding concrete details and context to scenes',
      levelDefinitions: JSON.stringify({
        approaching: 'Scenes remain vague; few concrete details provided',
        developing: 'Adds some details but scenes could be more grounded',
        proficient: 'Creates vivid, specific worlds with rich environmental details',
      }),
    },

    // Scene Work Skills (▲)
    {
      slug: 'character-work',
      name: 'Character Work',
      category: 'scene-work',
      categoryIcon: '▲',
      categoryColor: '#8B5CF6',
      description: 'Creating distinctive, believable characters',
      levelDefinitions: JSON.stringify({
        approaching: 'Characters feel generic or inconsistent',
        developing: 'Develops characters with some distinct traits and voice',
        proficient: 'Creates fully realized characters with consistent personality and physicality',
      }),
    },
    {
      slug: 'relationship',
      name: 'Relationship',
      category: 'scene-work',
      categoryIcon: '▲',
      categoryColor: '#8B5CF6',
      description: 'Establishing and exploring connections between characters',
      levelDefinitions: JSON.stringify({
        approaching: 'Relationship between characters unclear or underdeveloped',
        developing: 'Establishes basic relationship; explores it somewhat',
        proficient: 'Creates compelling relationships with clear dynamics and depth',
      }),
    },
    {
      slug: 'game',
      name: 'Game',
      category: 'scene-work',
      categoryIcon: '▲',
      categoryColor: '#8B5CF6',
      description: 'Finding and exploring the comedic pattern or premise of a scene',
      levelDefinitions: JSON.stringify({
        approaching: 'Game is unclear or abandoned quickly',
        developing: 'Finds game; explores it with some repetition',
        proficient: 'Identifies strong game and escalates it with precision and humor',
      }),
    },
    {
      slug: 'heightening',
      name: 'Heightening',
      category: 'scene-work',
      categoryIcon: '▲',
      categoryColor: '#8B5CF6',
      description: 'Escalating scenes with increasing stakes and energy',
      levelDefinitions: JSON.stringify({
        approaching: 'Scenes plateau; limited sense of escalation',
        developing: 'Attempts to heighten but increases feel forced or uneven',
        proficient: 'Naturally escalates scenes with compelling progression',
      }),
    },

    // Musical Skills (●)
    {
      slug: 'vocal-control',
      name: 'Vocal Control',
      category: 'musical',
      categoryIcon: '●',
      categoryColor: '#EC4899',
      description: 'Managing pitch, tone, and musicality in songs',
      levelDefinitions: JSON.stringify({
        approaching: 'Singing is often off-pitch or lacks musicality',
        developing: 'Generally on-pitch; musicality is present but inconsistent',
        proficient: 'Excellent pitch control and natural, expressive musicality',
      }),
    },
    {
      slug: 'ensemble-harmony',
      name: 'Ensemble Harmony',
      category: 'musical',
      categoryIcon: '●',
      categoryColor: '#EC4899',
      description: 'Blending voices and creating harmony with scene partners',
      levelDefinitions: JSON.stringify({
        approaching: 'Struggles to match pitch or blend with ensemble',
        developing: 'Can harmonize but sometimes strains or drops out',
        proficient: 'Seamlessly blends voice and contributes skilled harmonies',
      }),
    },
    {
      slug: 'rhythmic-accuracy',
      name: 'Rhythmic Accuracy',
      category: 'musical',
      categoryIcon: '●',
      categoryColor: '#EC4899',
      description: 'Maintaining steady tempo and rhythmic precision',
      levelDefinitions: JSON.stringify({
        approaching: 'Tempo frequently drifts; rhythm is unsteady',
        developing: 'Maintains tempo mostly; rhythm is mostly accurate',
        proficient: 'Rock-solid rhythm and tempo control even in complex patterns',
      }),
    },
    {
      slug: 'musical-storytelling',
      name: 'Musical Storytelling',
      category: 'musical',
      categoryIcon: '●',
      categoryColor: '#EC4899',
      description: 'Using music to advance narrative and emotion',
      levelDefinitions: JSON.stringify({
        approaching: 'Songs feel disconnected from scene; story unclear',
        developing: 'Songs relate to scene but emotional impact is limited',
        proficient: 'Music serves story powerfully; emotionally resonant performances',
      }),
    },
  ];

  const skills = await Promise.all(
    skillsData.map((skill) =>
      prisma.improvSkill.create({
        data: skill,
      })
    )
  );

  console.log('✓ Created 11 improv skills');

  // Create objectives for first 3 skills (as examples)
  for (let i = 0; i < 3; i++) {
    await prisma.improvObjective.create({
      data: {
        skillId: skills[i].id,
        sequenceNum: 1,
        text: `First objective for ${skills[i].name}`,
        description: `This is the first step in mastering ${skills[i].name}`,
      },
    });
    await prisma.improvObjective.create({
      data: {
        skillId: skills[i].id,
        sequenceNum: 2,
        text: `Second objective for ${skills[i].name}`,
        description: `This is the second step in mastering ${skills[i].name}`,
      },
    });
  }

  console.log('✓ Created objectives');

  // Create a test improv class
  const testClass = await prisma.improvClass.create({
    data: {
      name: 'Musical Improv Level 2',
      subtitle: 'The Anti-Hero\'s Journey',
      instructorId: kyle.id,
      numWeeks: 8,
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-05-31'),
      status: 'active',
    },
  });

  console.log('✓ Created test class');

  // Enroll students
  const enrollments = await Promise.all([
    prisma.improvEnrollment.create({
      data: {
        classId: testClass.id,
        studentId: student1.id,
        status: 'active',
      },
    }),
    prisma.improvEnrollment.create({
      data: {
        classId: testClass.id,
        studentId: student2.id,
        status: 'active',
      },
    }),
    prisma.improvEnrollment.create({
      data: {
        classId: testClass.id,
        studentId: student3.id,
        status: 'active',
      },
    }),
  ]);

  console.log('✓ Enrolled 3 students');

  // Create weeks
  const weeks = [];
  for (let i = 1; i <= 4; i++) {
    const week = await prisma.improvWeek.create({
      data: {
        classId: testClass.id,
        weekNum: i,
        title: `Week ${i}: ${['Foundations', 'Yes And', 'Listening', 'Character Work'][i - 1]}`,
        focusAreas: `Focus areas for week ${i}`,
        startDate: new Date(`2026-04-0${i}`),
      },
    });
    weeks.push(week);
  }

  console.log('✓ Created 4 weeks');

  // Assign anchor skills to first 2 weeks
  for (let w = 0; w < 2; w++) {
    for (let s = 0; s < 3; s++) {
      await prisma.improvWeekSkill.create({
        data: {
          weekId: weeks[w].id,
          skillId: skills[s].id,
          isAnchor: true,
          sequenceNum: s,
        },
      });
    }
  }

  console.log('✓ Assigned anchor skills to weeks');

  // Create sample ratings for week 1
  const week1 = weeks[0];
  const skill1 = skills[0];

  // Student self-rating
  await prisma.improvStudentRating.create({
    data: {
      enrollmentId: enrollments[0].id,
      weekId: week1.id,
      skillId: skill1.id,
      level: 'developing',
      narrative: 'I feel like I\'m getting better at accepting offers',
      evidence: 'My scenes have more back-and-forth with partners',
    },
  });

  // Teacher rating
  await prisma.improvTeacherRating.create({
    data: {
      enrollmentId: enrollments[0].id,
      weekId: week1.id,
      skillId: skill1.id,
      level: 'proficient',
      instructorNotes: 'Maya is already strong here. She builds naturally on partner offers.',
    },
  });

  // Feedback
  await prisma.improvFeedback.create({
    data: {
      enrollmentId: enrollments[0].id,
      weekId: week1.id,
      skillId: skill1.id,
      note: 'Great work this week! Keep building on that momentum.',
    },
  });

  console.log('✓ Created sample ratings and feedback');

  console.log('✅ Seeding complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

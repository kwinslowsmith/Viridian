import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with comprehensive sample data...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.eventRSVP.deleteMany();
  await prisma.event.deleteMany();
  await prisma.improvObjectiveAssessment.deleteMany();
  await prisma.improvClassSkill.deleteMany();
  await prisma.studentObjectiveProgress.deleteMany();
  await prisma.studentStandardProgress.deleteMany();
  await prisma.improvSkillAssessment.deleteMany();
  await prisma.improvFeedback.deleteMany();
  await prisma.improvTeacherRating.deleteMany();
  await prisma.improvStudentRating.deleteMany();
  await prisma.improvWeekSkill.deleteMany();
  await prisma.improvObjective.deleteMany();
  await prisma.improvWeek.deleteMany();
  await prisma.improvEnrollment.deleteMany();
  await prisma.improvClass.deleteMany();
  await prisma.improvSkill.deleteMany();
  await prisma.standardResource.deleteMany();
  await prisma.organizationStandardsBankAdoption.deleteMany();
  await prisma.exampleObjective.deleteMany();
  await prisma.standard.deleteMany();
  await prisma.standardsBank.deleteMany();
  await prisma.learningCommunityMember.deleteMany();
  await prisma.communityJoinRequest.deleteMany();
  await prisma.learningModule.deleteMany();
  await prisma.learningCommunity.deleteMany();
  await prisma.organizationRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // Create organization
  console.log('Creating organization...');
  const org = await prisma.organization.create({
    data: {
      name: 'MF Improv',
      slug: 'mf-improv',
      description: 'Musical Improv Mastery & Ensemble Development',
      topic: 'improvisation',
      isPublic: true,
    },
  });

  // Create teachers
  console.log('Creating teachers...');
  const kyle = await prisma.user.create({
    data: {
      email: 'kyle@example.com',
      name: 'Kyle Winslow Smith',
      role: 'instructor',
      passwordHash,
    },
  });

  const teacher1 = await prisma.user.create({
    data: {
      email: 'sarah@example.com',
      name: 'Sarah Chen',
      role: 'instructor',
      passwordHash,
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      email: 'marcus@example.com',
      name: 'Marcus Johnson',
      role: 'instructor',
      passwordHash,
    },
  });

  // Create students
  console.log('Creating students...');
  const students = [];
  for (let i = 1; i <= 6; i++) {
    const student = await prisma.user.create({
      data: {
        email: `student${i}@example.com`,
        name: `Student ${i}`,
        role: 'student',
        passwordHash,
      },
    });
    students.push(student);
  }

  // Set up organization roles
  console.log('Setting up organization roles...');
  await prisma.organizationRole.create({
    data: { userId: kyle.id, organizationId: org.id, role: 'SuperAdmin' },
  });
  await prisma.organizationRole.create({
    data: { userId: teacher1.id, organizationId: org.id, role: 'Teacher' },
  });
  await prisma.organizationRole.create({
    data: { userId: teacher2.id, organizationId: org.id, role: 'Teacher' },
  });
  await Promise.all(
    students.map((student) =>
      prisma.organizationRole.create({
        data: { userId: student.id, organizationId: org.id, role: 'Student' },
      })
    )
  );

  // Create Improv Skills with 4-level proficiency scale
  console.log('Creating Improv skills...');
  const skillsData = [
    // Foundation (4 skills)
    {
      slug: 'yes-and',
      name: 'Yes And',
      category: 'foundation',
      categoryIcon: '◆',
      categoryColor: '#D97706',
      description: 'Accepting your partner\'s reality and building meaningfully on it.',
      levelDefinitions: {
        approaching: 'Accepts offers without negation but adds little or generic information.',
        developing: 'Consistently accepts and adds; additions are clear but often predictable.',
        proficient: 'Accepts offers and adds specific, unexpected information that advances the scene.',
        advanced: 'Creates cascading offers that open multiple scene possibilities for partners.',
      },
    },
    {
      slug: 'listening',
      name: 'Listening',
      category: 'foundation',
      categoryIcon: '◆',
      categoryColor: '#D97706',
      description: 'Receiving and responding to all offers -- verbal, physical, and emotional.',
      levelDefinitions: {
        approaching: 'Responds to verbal offers but misses physical or emotional cues from partners.',
        developing: 'Tracks most offers and incorporates them; occasional missed opportunities.',
        proficient: 'Receives and responds to the full range of offers -- nothing is wasted.',
        advanced: 'Anticipates unspoken offers and builds on partners\' energy before it\'s explicitly stated.',
      },
    },
    {
      slug: 'spontaneity',
      name: 'Spontaneity',
      category: 'foundation',
      categoryIcon: '◆',
      categoryColor: '#D97706',
      description: 'Making committed first-instinct choices without overthinking.',
      levelDefinitions: {
        approaching: 'Makes choices but hesitates or visibly second-guesses in the moment.',
        developing: 'Quick choices in low-stakes moments; hedges or stalls under pressure.',
        proficient: 'Commits immediately and specifically to first instinct across all contexts.',
        advanced: 'Commits with such confidence that hesitation becomes a character choice.',
      },
    },
    {
      slug: 'agreement',
      name: 'Agreement',
      category: 'foundation',
      categoryIcon: '◆',
      categoryColor: '#D97706',
      description: 'Acknowledging and matching your partner\'s reality, energy, and emotion.',
      levelDefinitions: {
        approaching: 'Verbally acknowledges partner but body language or energy contradicts the offer.',
        developing: 'Matches partner\'s reality consistently; occasional energy or emotional mismatches.',
        proficient: 'Mirrors and extends partner\'s reality physically, vocally, and emotionally.',
        advanced: 'Agreement becomes so embodied it influences the scene\'s tone and trajectory.',
      },
    },
    // Scene Work (3 skills)
    {
      slug: 'who-what-where',
      name: 'Who / What / Where',
      category: 'scene-work',
      categoryIcon: '▲',
      categoryColor: '#0D9488',
      description: 'Establishing and using the three pillars of scene grounding.',
      levelDefinitions: {
        approaching: 'Establishes at least one element but leaves others unclear through most of the scene.',
        developing: 'Establishes all three elements within the first minute.',
        proficient: 'Establishes Who/What/Where early and actively uses them to drive scene decisions.',
        advanced: 'Uses the three pillars to create rich, specific worlds that support complex narratives.',
      },
    },
    {
      slug: 'object-work',
      name: 'Object Work',
      category: 'scene-work',
      categoryIcon: '▲',
      categoryColor: '#0D9488',
      description: 'Using mimed objects with consistency, specificity, and purpose.',
      levelDefinitions: {
        approaching: 'Uses mimed objects but size, weight, or placement are inconsistent.',
        developing: 'Maintains consistent objects; choices are functional but not character-driven.',
        proficient: 'Object work is specific, consistent, and reveals character or advances narrative.',
        advanced: 'Objects become extensions of character psychology and thematic exploration.',
      },
    },
    {
      slug: 'character',
      name: 'Character',
      category: 'scene-work',
      categoryIcon: '▲',
      categoryColor: '#0D9488',
      description: 'Making and sustaining distinct physical, vocal, and emotional choices.',
      levelDefinitions: {
        approaching: 'Makes a character choice at the start but drops or forgets it mid-scene.',
        developing: 'Maintains character choices consistently; clear but not yet specific.',
        proficient: 'Character choices are specific, sustained, and actively drive decisions.',
        advanced: 'Character work reveals psychological depth and creates unexpected emotional landscapes.',
      },
    },
    // Musical (4 skills)
    {
      slug: 'song-structure',
      name: 'Song Structure',
      category: 'musical',
      categoryIcon: '●',
      categoryColor: '#7C3AED',
      description: 'Understanding and executing chorus-first song architecture.',
      levelDefinitions: {
        approaching: 'Attempts a structure but loses track of chorus/verse distinction mid-song.',
        developing: 'Executes chorus-first structure consistently; transitions can feel mechanical.',
        proficient: 'Uses structure with intentionality -- structure serves emotion, not the reverse.',
        advanced: 'Structure becomes invisible because it perfectly serves the emotional arc.',
      },
    },
    {
      slug: 'emotional-truth',
      name: 'Emotional Truth',
      category: 'musical',
      categoryIcon: '●',
      categoryColor: '#7C3AED',
      description: 'Connecting song to genuine felt emotion in the scene moment.',
      levelDefinitions: {
        approaching: 'Sings in key and rhythm but emotional connection to the scene moment is absent.',
        developing: 'Finds the emotional truth but cannot sustain it through the full song.',
        proficient: 'Song reveals interior emotional life not accessible through dialogue alone.',
        advanced: 'Song becomes a profound moment of vulnerability that transforms the scene.',
      },
    },
    {
      slug: 'chorus-first',
      name: 'Chorus-First',
      category: 'musical',
      categoryIcon: '●',
      categoryColor: '#7C3AED',
      description: 'Opening every song with a singable, repeatable emotional hook.',
      levelDefinitions: {
        approaching: 'Opens with a verse or spoken line instead of a committed chorus.',
        developing: 'Opens with a chorus but it is generic or misses the emotional core.',
        proficient: 'Chorus lands immediately as a specific hook that defines the song\'s emotional thesis.',
        advanced: 'Chorus becomes so compelling others instinctively want to join or remember it.',
      },
    },
    {
      slug: 'narrative-in-song',
      name: 'Narrative in Song',
      category: 'musical',
      categoryIcon: '●',
      categoryColor: '#7C3AED',
      description: 'Using song to do both emotional and narrative work simultaneously.',
      levelDefinitions: {
        approaching: 'Song expresses emotion or advances narrative -- rarely both at once.',
        developing: 'Song does both but one dimension consistently dominates.',
        proficient: 'Song creates a turning point -- the scene is meaningfully different after than before.',
        advanced: 'Song becomes the emotional climax that recontextualizes the entire scene.',
      },
    },
  ];

  const skills = await Promise.all(
    skillsData.map((skill) =>
      prisma.improvSkill.create({
        data: {
          slug: skill.slug,
          name: skill.name,
          category: skill.category,
          categoryIcon: skill.categoryIcon,
          categoryColor: skill.categoryColor,
          description: skill.description,
          levelDefinitions: JSON.stringify(skill.levelDefinitions),
          isActive: true,
        },
      })
    )
  );
  console.log(`✅ Created ${skills.length} Improv skills`);

  // Create classes
  console.log('Creating classes...');
  const now = new Date();
  const class1 = await prisma.improvClass.create({
    data: {
      name: 'Musical Improv 101 - Foundations',
      subtitle: 'Listening, Yes-And, and Basic Scene Work',
      organizationId: org.id,
      instructorId: kyle.id,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 3, 30),
      numWeeks: 12,
      status: 'active',
      weeks: {
        create: [
          {
            weekNum: 1,
            title: 'Listening and Agreement',
            startDate: new Date(now.getFullYear(), now.getMonth(), 1),
            endDate: new Date(now.getFullYear(), now.getMonth(), 7),
          },
          {
            weekNum: 2,
            title: 'Yes, And... The Foundation',
            startDate: new Date(now.getFullYear(), now.getMonth(), 8),
            endDate: new Date(now.getFullYear(), now.getMonth(), 14),
          },
          {
            weekNum: 3,
            title: 'Character Work & Emotion',
            startDate: new Date(now.getFullYear(), now.getMonth(), 15),
            endDate: new Date(now.getFullYear(), now.getMonth(), 21),
          },
        ],
      },
    },
  });

  const class2 = await prisma.improvClass.create({
    data: {
      name: 'Musical Improv 201 - Advanced Techniques',
      subtitle: 'Harmony, Counterpoint, and Musical Form',
      organizationId: org.id,
      instructorId: teacher1.id,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 3, 30),
      numWeeks: 12,
      status: 'active',
      weeks: {
        create: [
          {
            weekNum: 1,
            title: 'Harmony & Chord Changes',
            startDate: new Date(now.getFullYear(), now.getMonth(), 1),
            endDate: new Date(now.getFullYear(), now.getMonth(), 7),
          },
          {
            weekNum: 2,
            title: 'Counterpoint & Layering',
            startDate: new Date(now.getFullYear(), now.getMonth(), 8),
            endDate: new Date(now.getFullYear(), now.getMonth(), 14),
          },
        ],
      },
    },
  });

  const class3 = await prisma.improvClass.create({
    data: {
      name: 'Musical Improv 301 - Ensemble & Orchestration',
      subtitle: 'Large group improvisation and musical leadership',
      organizationId: org.id,
      instructorId: teacher2.id,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 3, 30),
      numWeeks: 8,
      status: 'active',
      weeks: {
        create: [
          {
            weekNum: 1,
            title: 'Large Ensemble Dynamics',
            startDate: new Date(now.getFullYear(), now.getMonth(), 1),
            endDate: new Date(now.getFullYear(), now.getMonth(), 7),
          },
        ],
      },
    },
  });

  // Enroll students in classes
  console.log('Enrolling students in classes...');
  const enrollments = [
    { classId: class1.id, studentIds: [students[0].id, students[1].id, students[2].id] },
    { classId: class2.id, studentIds: [students[1].id, students[2].id, students[3].id] },
    { classId: class3.id, studentIds: [students[3].id, students[4].id, students[5].id] },
  ];

  for (const enrollment of enrollments) {
    for (const studentId of enrollment.studentIds) {
      await prisma.improvEnrollment.create({
        data: {
          classId: enrollment.classId,
          studentId: studentId,
          status: 'active',
        },
      });
    }
  }

  // Create learning communities
  console.log('Creating learning communities...');
  const communityLevel1 = await prisma.learningCommunity.create({
    data: {
      slug: 'level-1-beginners',
      name: 'Level 1 - Beginners',
      description: 'Community for all beginners learning musical improv',
      scope: 'organization',
      organizationId: org.id,
      curatorId: kyle.id,
      status: 'active',
      isPublic: true,
      requiresApprovalToJoin: false,
      difficulty: 'beginner',
      modules: {
        create: [
          {
            title: 'Module 1: Listening Basics',
            sequenceNum: 1,
            estimatedHours: 2,
          },
          {
            title: 'Module 2: Yes, And! Fundamentals',
            sequenceNum: 2,
            estimatedHours: 2,
          },
        ],
      },
    },
  });

  const communityLevel2 = await prisma.learningCommunity.create({
    data: {
      slug: 'level-2-intermediate',
      name: 'Level 2 - Intermediate',
      description: 'For students mastering intermediate techniques',
      scope: 'organization',
      organizationId: org.id,
      curatorId: teacher1.id,
      status: 'active',
      isPublic: true,
      requiresApprovalToJoin: false,
      difficulty: 'intermediate',
    },
  });

  const communityLevel3 = await prisma.learningCommunity.create({
    data: {
      slug: 'level-3-advanced',
      name: 'Level 3 - Advanced',
      description: 'Advanced students and teachers working on ensemble work',
      scope: 'organization',
      organizationId: org.id,
      curatorId: teacher2.id,
      status: 'active',
      isPublic: true,
      requiresApprovalToJoin: false,
      difficulty: 'advanced',
    },
  });

  const communityTeachers = await prisma.learningCommunity.create({
    data: {
      slug: 'teachers-circle',
      name: 'Teachers Circle',
      description: 'Private community for instructors to share techniques',
      scope: 'organization',
      organizationId: org.id,
      curatorId: kyle.id,
      status: 'active',
      isPublic: false,
      requiresApprovalToJoin: true,
      difficulty: 'advanced',
    },
  });

  // Add community members
  console.log('Adding community members...');
  const communities = [
    { community: communityLevel1, users: [students[0], students[1], students[2]] },
    { community: communityLevel2, users: [students[1], students[2], students[3]] },
    { community: communityLevel3, users: [students[3], students[4], students[5], teacher1, teacher2] },
    { community: communityTeachers, users: [kyle, teacher1, teacher2] },
  ];

  for (const { community, users } of communities) {
    for (const user of users) {
      await prisma.learningCommunityMember.create({
        data: {
          communityId: community.id,
          userId: user.id,
          role: 'member',
          status: 'active',
        },
      });
    }
  }

  // Create events
  console.log('Creating events...');
  // Class event (Level 1 - Beginners showcase)
  const classEvent = await prisma.event.create({
    data: {
      title: '🎵 Level 1 Showcase - Listening & Agreement',
      description: 'First showcase for Level 1 students. Come see what they\'ve learned!',
      organizationId: org.id,
      createdById: kyle.id,
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 15, 19, 0),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 15, 21, 0),
      location: 'Main Theater',
      recurrenceType: 'none',
      status: 'scheduled',
    },
  });

  // Org-wide event
  const orgEvent = await prisma.event.create({
    data: {
      title: '🎸 Monthly Jam Session',
      description: 'All levels welcome! Come improvise with fellow musicians.',
      organizationId: org.id,
      createdById: teacher1.id,
      startDate: new Date(now.getFullYear(), now.getMonth(), 20, 18, 0),
      endDate: new Date(now.getFullYear(), now.getMonth(), 20, 19, 30),
      location: 'Studio A',
      recurrenceType: 'monthly',
      recurrenceEndDate: new Date(now.getFullYear() + 1, now.getMonth(), 20),
      status: 'scheduled',
    },
  });

  // Community event (Teachers Circle)
  const communityEvent = await prisma.event.create({
    data: {
      title: '👥 Teachers Technique Workshop',
      description: 'Advanced teaching techniques and student feedback',
      communityId: communityTeachers.id,
      createdById: kyle.id,
      startDate: new Date(now.getFullYear(), now.getMonth() + 2, 10, 14, 0),
      endDate: new Date(now.getFullYear(), now.getMonth() + 2, 10, 16, 0),
      location: 'Studio B',
      recurrenceType: 'none',
      status: 'scheduled',
    },
  });

  // Add RSVPs to events
  console.log('Adding RSVPs to events...');
  const classEventAttendees = [kyle, ...students.slice(0, 3)];
  for (const user of classEventAttendees) {
    await prisma.eventRSVP.create({
      data: {
        eventId: classEvent.id,
        userId: user.id,
        status: 'attending',
      },
    });
  }

  const orgEventAttendees = [teacher1, ...students];
  for (const user of orgEventAttendees) {
    await prisma.eventRSVP.create({
      data: {
        eventId: orgEvent.id,
        userId: user.id,
        status: 'attending',
      },
    });
  }

  const communityEventAttendees = [kyle, teacher1, teacher2];
  for (const user of communityEventAttendees) {
    await prisma.eventRSVP.create({
      data: {
        eventId: communityEvent.id,
        userId: user.id,
        status: 'attending',
      },
    });
  }

  // Add skills to classes and create objectives for testing
  console.log('Setting up class skills and objectives...');

  // Add Agreement skill to class1
  const agreementSkill = await prisma.improvSkill.findFirst({
    where: { slug: 'agreement' },
  });

  if (agreementSkill) {
    const classSkill1 = await prisma.improvClassSkill.create({
      data: {
        classId: class1.id,
        skillId: agreementSkill.id,
        mandatoryObjectiveCount: 3,
        totalObjectivesRequired: 5,
        sequenceNum: 1,
      },
    });

    // Create some test objectives for this skill
    const objective1 = await prisma.improvObjective.create({
      data: {
        skillId: agreementSkill.id,
        text: 'Demonstrate on multiple occasions and through different scenes the ability to Yes and a reality that another character creates.',
        isMandatory: true,
        isCustom: true,
        assessmentGuidance: 'https://docs.google.com/document/d/1example/edit',
        sequenceNum: 1,
      },
    });

    const objective2 = await prisma.improvObjective.create({
      data: {
        skillId: agreementSkill.id,
        text: 'Match your partner\'s emotional state without hesitation.',
        isMandatory: true,
        isCustom: true,
        assessmentGuidance: 'Record a video scene showing emotional matching',
        sequenceNum: 2,
      },
    });

    const objective3 = await prisma.improvObjective.create({
      data: {
        skillId: agreementSkill.id,
        text: 'Build on partner\'s offers with specific additions.',
        isMandatory: true,
        isCustom: true,
        assessmentGuidance: '',
        sequenceNum: 3,
      },
    });

    const objective4 = await prisma.improvObjective.create({
      data: {
        skillId: agreementSkill.id,
        text: 'Physically mirror partner\'s body language.',
        isMandatory: false,
        isCustom: true,
        assessmentGuidance: '',
        sequenceNum: 4,
      },
    });

    const objective5 = await prisma.improvObjective.create({
      data: {
        skillId: agreementSkill.id,
        text: 'Use agreement to establish scene location.',
        isMandatory: false,
        isCustom: true,
        assessmentGuidance: '',
        sequenceNum: 5,
      },
    });

    // Add some student submissions with various states
    console.log('Creating student submissions...');

    // Student 1 - some submitted, some with feedback
    await prisma.improvObjectiveAssessment.create({
      data: {
        classId: class1.id,
        objectiveId: objective1.id,
        studentId: students[0].id,
        submissionType: 'text',
        submissionText: 'I practiced saying yes and in multiple scenes with my partner. In the first scene, she established we were in a coffee shop, and I confirmed we were making lattes together. In the second scene, we were detectives, and I added that we were looking for a stolen diamond.',
        studentRating: 4,
        studentFeedback: 'I felt good about my ability to build on the reality in the second scene.',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'graded',
        teacherFeedback: 'Excellent work! Your additions in the detective scene were specific and moved the story forward. Great progress.',
        gradeAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.improvObjectiveAssessment.create({
      data: {
        classId: class1.id,
        objectiveId: objective2.id,
        studentId: students[0].id,
        submissionType: 'text',
        submissionText: 'In our improv scenes, I focused on matching my partner\'s energy. When she came in sad about losing her job, I responded with concern and support. When she was excited about a new opportunity, I matched her enthusiasm.',
        studentRating: 3,
        studentFeedback: 'Sometimes I can match the emotion, but I think I need to work on being more consistent with my vocal tone to fully express the emotion.',
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'graded',
        teacherFeedback: 'Good instincts on matching the emotional content. I noticed you were mainly using facial expressions - try incorporating your voice and body more fully next time.',
        gradeAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.improvObjectiveAssessment.create({
      data: {
        classId: class1.id,
        objectiveId: objective3.id,
        studentId: students[0].id,
        submissionType: 'text',
        submissionText: 'I am still working on this skill.',
        studentRating: 2,
        studentFeedback: 'I struggled with finding specific additions during our recent scenes.',
        submittedAt: new Date(),
        status: 'submitted',
      },
    });

    // Student 2 - mix of graded and submitted
    await prisma.improvObjectiveAssessment.create({
      data: {
        classId: class1.id,
        objectiveId: objective1.id,
        studentId: students[1].id,
        submissionType: 'google-doc',
        submissionUrl: 'https://docs.google.com/document/d/1-example-doc/edit',
        studentRating: 3,
        studentFeedback: 'I documented three different scene examples.',
        submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        status: 'graded',
        teacherFeedback: 'Nice documentation! The scenes show solid yes-and technique. Make sure your additions are always driving the narrative forward.',
        gradeAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.improvObjectiveAssessment.create({
      data: {
        classId: class1.id,
        objectiveId: objective2.id,
        studentId: students[1].id,
        submissionType: 'text',
        submissionText: 'Working on emotional matching.',
        studentRating: null,
        studentFeedback: 'Still developing this skill.',
        submittedAt: new Date(),
        status: 'submitted',
      },
    });

    // Student 3 - one submission
    await prisma.improvObjectiveAssessment.create({
      data: {
        classId: class1.id,
        objectiveId: objective1.id,
        studentId: students[2].id,
        submissionType: 'text',
        submissionText: 'In my recent scenes, I focused on accepting the reality my partner established and building meaningfully on it. In one scene where my partner said we were opening a bakery, I added specific details about our signature pastries.',
        studentRating: 4,
        studentFeedback: 'I really enjoyed exploring the bakery scenario with my partner.',
        submittedAt: new Date(),
        status: 'submitted',
      },
    });
  }

  console.log('✅ Seeding complete!');
  console.log('📊 Created:');
  console.log(`  - 1 organization (MF Improv)`);
  console.log(`  - 3 teachers + 6 students = 9 users`);
  console.log(`  - 3 classes with students enrolled`);
  console.log(`  - 4 learning communities (Level 1, Level 2, Level 3, Teachers Circle)`);
  console.log(`  - 3 events (class showcase, monthly jam, teacher workshop)`);
  console.log(`\n🔑 Test Credentials:`);
  console.log(`  - kyle@example.com (SuperAdmin)`);
  console.log(`  - sarah@example.com (Teacher)`);
  console.log(`  - marcus@example.com (Teacher)`);
  console.log(`  - student1@example.com through student6@example.com (Students)`);
  console.log(`\n💡 Try creating events and assigning them to classes, the org, or communities!`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

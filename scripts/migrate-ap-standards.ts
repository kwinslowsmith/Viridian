import { prisma } from '../lib/prisma';

// AP US History Standards Data
const apUsHistoryData = {
  courseCode: 'APUSH',
  courseName: 'AP U.S. History',
  units: [
    {
      sequenceNum: 1,
      name: 'Unit 1: Period 1 (1491-1607)',
      standards: [
        {
          code: '1.1',
          name: 'Native American Societies Before European Contact',
          essentialKnowledge: [
            'As native populations migrated and settled across North America, they developed distinct societies by adapting to their diverse environments.',
            'Different native societies adapted to and transformed their environments through innovations in agriculture, resource use, and social structure.',
            'The spread of maize cultivation supported economic development and settlement in the Southwest.',
            'Societies responded to aridity by developing mobile lifestyles in the Great Basin and western Great Plains.',
            'In the Northeast and Atlantic seaboard, some societies developed permanent villages.',
            'Northwest and California societies supported themselves by hunting and gathering, developing settled communities.',
          ],
          learningObjectives: ['Explain the context for European encounters in the Americas from 1491 to 1607.'],
        },
        {
          code: '1.2',
          name: 'European Exploration and Columbian Exchange',
          essentialKnowledge: [
            'European nations explored and conquered the New World seeking wealth, economic advantage, and to spread Christianity.',
            'The Columbian Exchange brought new crops to Europe, stimulating population growth.',
            'New sources of mineral wealth facilitated the European shift from feudalism to capitalism.',
            'Maritime technology improvements and joint-stock companies drove international trade.',
            'Spanish exploration was accompanied by deadly epidemics that devastated native populations.',
            'Spanish colonial labor systems, including the encomienda system, relied on Native American labor.',
            'Contact among Europeans, Native Americans, and Africans resulted in the Columbian Exchange and significant social changes.',
          ],
          learningObjectives: [
            'Explain how various native populations interacted with the natural environment in North America.',
            'Explain the causes of exploration and conquest of the New World by various European nations.',
            'Explain causes of the Columbian Exchange and its effects on Europe and the Americas after 1492.',
            'Explain the systems of slavery and labor that developed in the New World.',
            'Explain the cultural interactions and exchanges between European, Native American, and African peoples.',
          ],
        },
      ],
    },
    {
      sequenceNum: 2,
      name: 'Unit 2: Period 2 (1607-1754)',
      standards: [
        {
          code: '2.1',
          name: 'European Colonial Settlement Patterns',
          essentialKnowledge: [
            'European colonizers established settlements along the Atlantic Coast, Caribbean, and interior waterways.',
            'The English, French, Dutch, and Spanish competed for economic and political control in North America.',
            'The French focused on trade (particularly furs) and conversion of Native Americans.',
            'The Spanish established a complex colonial system with encomienda and hacienda.',
            'The Dutch engaged in commerce and trade monopolies.',
            'The English established settler colonies with permanent settlements and agricultural focus.',
          ],
          learningObjectives: [
            'Explain the context for the founding and development of colonial North America.',
            'Explain the differences among the Spanish, French, Dutch, and English patterns of colonization.',
          ],
        },
        {
          code: '2.2',
          name: 'Chesapeake, New England, and Middle Colonies Development',
          essentialKnowledge: [
            'Tobacco cultivation drove economic development in Virginia and Maryland.',
            'Indentured servitude and slavery developed as labor systems in the Chesapeake.',
            'Religious motivations (Puritanism) shaped New England settlement.',
            'Covenant theology influenced New England community structure and governance.',
            'Dense settlement patterns and small farm agriculture developed in New England.',
            'Multiple religious and ethnic groups settled in the Middle colonies.',
            'Religious toleration attracted diverse settlers to the Middle colonies.',
            'Complex land systems and mixed agricultural/commercial economies developed.',
          ],
          learningObjectives: [
            'Explain the economic development and social structures of the Chesapeake colonies.',
            'Explain the development of the New England colonies and the development of colonial identity.',
            'Explain the development and diversity of the Middle colonies.',
          ],
        },
      ],
    },
    {
      sequenceNum: 3,
      name: 'Unit 3: Period 3 (1754-1800)',
      standards: [
        {
          code: '3.1',
          name: 'Revolutionary Era and Early Republic',
          essentialKnowledge: [
            'British colonial expansion after the French and Indian War created tensions.',
            'Enlightenment ideas influenced American political thought.',
            'Economic and political grievances prompted colonial resistance.',
            'Colonial competition for resources and land led to the French and Indian War.',
            'British victory resulted in expanded colonial territory but also increased debt.',
            'The war disrupted the balance between British control and colonial autonomy.',
            'Taxation without representation sparked colonial resistance.',
            'The Declaration of Independence articulated natural rights philosophy.',
            'American victory established the United States as an independent nation.',
          ],
          learningObjectives: [
            'Explain the context for the American Revolution and formation of the early United States.',
            'Explain the causes and consequences of the French and Indian War.',
            'Explain the causes and consequences of the American Revolution.',
          ],
        },
      ],
    },
  ],
};

// Simplified versions for AP World History, AP Gov, Pre-AP World
const apWorldHistoryData = {
  courseCode: 'APWH',
  courseName: 'AP World History: Modern',
  units: [
    {
      sequenceNum: 1,
      name: 'Unit 1: Global Tapestry (1450-1650)',
      standards: [
        {
          code: '1.1',
          name: 'Technological Innovations and Global Connections',
          essentialKnowledge: [
            'Maritime technologies and trade networks connected diverse regions of the world.',
            'Innovations in navigation enabled European exploration of the Indian Ocean.',
            'Technological exchange between civilizations accelerated through trade.',
            'The Columbian Exchange connected the Americas to Afro-Eurasia.',
          ],
          learningObjectives: [
            'Identify technological innovations that facilitated global connections.',
            'Explain how trade networks connected people across continents.',
          ],
        },
      ],
    },
  ],
};

const apGovernmentData = {
  courseCode: 'APGOV',
  courseName: 'AP U.S. Government and Politics',
  units: [
    {
      sequenceNum: 1,
      name: 'Unit 1: Foundations of U.S. Government',
      standards: [
        {
          code: '1.1',
          name: 'Constitutional Principles and Historical Development',
          essentialKnowledge: [
            'The Constitution establishes a federal system dividing power between national and state governments.',
            'Separation of powers distributes authority among executive, legislative, and judicial branches.',
            'Checks and balances ensure no single branch becomes too powerful.',
            'The Bill of Rights protects individual liberties from government infringement.',
            'The Constitution has been amended to reflect changing values and circumstances.',
          ],
          learningObjectives: [
            'Explain the historical development of the Constitution.',
            'Describe the principles of federalism, separation of powers, and checks and balances.',
          ],
        },
      ],
    },
  ],
};

const preApWorldHistoryData = {
  courseCode: 'PREAPH',
  courseName: 'Pre-AP World History',
  units: [
    {
      sequenceNum: 1,
      name: 'Unit 1: Foundations of World Civilizations',
      standards: [
        {
          code: '1.1',
          name: 'Early Human Societies and Agricultural Development',
          essentialKnowledge: [
            'Hunter-gatherer societies adapted to diverse environments across the globe.',
            'The development of agriculture enabled permanent settlements and population growth.',
            'Agricultural civilizations developed in river valleys and favorable geographic regions.',
            'Early civilizations developed writing systems, legal codes, and complex social hierarchies.',
          ],
          learningObjectives: [
            'Analyze the transition from hunter-gatherer to agricultural societies.',
            'Explain the factors that contributed to the rise of early civilizations.',
          ],
        },
      ],
    },
  ],
};

async function migrateStandards() {
  try {
    console.log('Starting AP Standards migration...');

    // Find Match Charter organization
    let org = await prisma.organization.findUnique({
      where: { slug: 'match-charter-high-school' },
    });

    if (!org) {
      console.error('Match Charter organization not found.');
      return;
    }

    console.log(`Found organization: ${org.name}`);

    const courses = [
      { data: apUsHistoryData, type: 'content' as const },
      { data: apWorldHistoryData, type: 'content' as const },
      { data: apGovernmentData, type: 'content' as const },
      { data: preApWorldHistoryData, type: 'content' as const },
    ];

    for (const course of courses) {
      const courseData = course.data;
      console.log(`\nProcessing ${courseData.courseName}...`);

      for (const unitData of courseData.units) {
        // Create or find unit
        let unit = await prisma.unit.upsert({
          where: { id: `${courseData.courseCode}-unit-${unitData.sequenceNum}` },
          create: {
            id: `${courseData.courseCode}-unit-${unitData.sequenceNum}`,
            code: `${unitData.sequenceNum}`,
            name: unitData.name,
            sequenceNum: unitData.sequenceNum,
            organizationId: org.id,
          },
          update: { name: unitData.name },
        });

        console.log(`  Created unit: ${unit.name}`);

        for (const standardData of unitData.standards) {
          let objectiveLabel = 'A';

          for (const ek of standardData.essentialKnowledge) {
            // Create standard for each EK
            const standardId = `${courseData.courseCode}-${standardData.code}-${objectiveLabel}`;
            let standard = await prisma.standard.upsert({
              where: { id: standardId },
              create: {
                id: standardId,
                code: `${standardData.code}`,
                name: standardData.name,
                type: course.type,
                unitId: unit.id,
                organizationId: org.id,
              },
              update: { name: standardData.name },
            });

            // Create example objective for this EK
            await prisma.exampleObjective.upsert({
              where: { id: `${standardId}-obj` },
              create: {
                id: `${standardId}-obj`,
                standardId: standard.id,
                label: objectiveLabel,
                text: ek,
                description: null,
                sequenceNum: objectiveLabel.charCodeAt(0) - 65,
              },
              update: { text: ek },
            });

            objectiveLabel = String.fromCharCode(objectiveLabel.charCodeAt(0) + 1);
          }

          console.log(`    Created standard: ${standardData.code} with ${standardData.essentialKnowledge.length} EKs`);
        }
      }
    }

    console.log('\n✅ AP Standards migration completed successfully!');
    console.log('Standards are now in the database and ready to assign to classes.');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateStandards().catch(console.error);

// Match Charter High School - Seed Data
// Extracted and simplified from viridian.html AP Standards

export const matchCharterSeedData = {
  organization: {
    name: 'Match Charter High School',
    slug: 'match-charter-high-school',
    description: 'A premier charter school focused on college prep humanities curriculum',
    topic: 'education',
    isPublic: false,
  },
  departments: [
    {
      name: 'Humanities Department',
      type: 'Department',
      description: 'AP History and Social Sciences courses',
    },
    {
      name: 'Science Department',
      type: 'Department',
      description: 'Science courses',
    },
    {
      name: 'Mathematics Department',
      type: 'Department',
      description: 'Math courses',
    },
    {
      name: 'English Department',
      type: 'Department',
      description: 'English and Language Arts courses',
    },
  ],
  courses: [
    {
      name: 'Pre-AP World History',
      department: 'Humanities Department',
      gradeLevel: '9',
      code: 'pw-hs',
      skillStandards: [
        {
          code: 'pw-rs',
          name: 'Reasoning Skills',
          description: 'Foundation for AP-level historical thinking',
          type: 'skill',
          objectives: [
            { label: 'A', text: 'Argumentation', description: 'Makes a supported claim in response to a historical question' },
            { label: 'B', text: 'Contextualization', description: 'Describes relevant historical background for a development' },
            { label: 'C', text: 'Causation', description: 'Identifies at least one cause and one effect of a historical development' },
          ],
        },
      ],
      contentStandards: [
        {
          code: 'pw-1',
          name: 'Unit 1: The Ancient World (c. 3500 BCE–c. 600 CE)',
          description: 'Early civilizations, classical empires, and cultural exchange',
          type: 'content',
          objectives: [
            { label: 'A', text: 'Early Civilizations and State Formation', description: 'Describes key features of early river valley civilizations' },
            { label: 'B', text: 'Classical Empires and Their Legacies', description: 'Explains political, economic, and cultural features of classical empires' },
            { label: 'C', text: 'Religion and Cultural Exchange', description: 'Describes origins and core beliefs of major world religions' },
          ],
        },
        {
          code: 'pw-2',
          name: 'Unit 2: The Postclassical World (c. 600–c. 1450)',
          description: 'Islamic civilization, Mongol empires, and African kingdoms',
          type: 'content',
          objectives: [
            { label: 'A', text: 'Islamic Civilization and Abbasid Caliphate', description: 'Describes origins, expansion, and core beliefs of Islam' },
            { label: 'B', text: 'Mongol Empire and Cross-Cultural Connection', description: 'Describes formation and extent of the Mongol Empire' },
            { label: 'C', text: 'African Kingdoms and Indian Ocean Trade', description: 'Describes wealth and political organization of major African kingdoms' },
          ],
        },
        {
          code: 'pw-3',
          name: 'Unit 3: The Early Modern World (c. 1450–c. 1750)',
          description: 'European exploration, Atlantic slave trade, and gunpowder empires',
          type: 'content',
          objectives: [
            { label: 'A', text: 'European Exploration and Columbian Exchange', description: 'Explains motivations and technological developments enabling exploration' },
            { label: 'B', text: 'Atlantic Slave Trade and Its Consequences', description: 'Describes scale, mechanisms, and routes of the Atlantic slave trade' },
            { label: 'C', text: 'Gunpowder Empires', description: 'Describes key features of Ottoman, Safavid, and Mughal empires' },
          ],
        },
        {
          code: 'pw-4',
          name: 'Unit 4: Revolutions and Industrialization (c. 1750–c. 1900)',
          description: 'Age of Revolutions, industrialization, and imperialism',
          type: 'content',
          objectives: [
            { label: 'A', text: 'Age of Revolutions', description: 'Describes key ideas of Enlightenment and their political consequences' },
            { label: 'B', text: 'Industrialization and Social Consequences', description: 'Describes how industrialization transformed production, labor, and urban life' },
            { label: 'C', text: 'Imperialism and Resistance', description: 'Describes motivations and methods of European imperialism' },
          ],
        },
        {
          code: 'pw-5',
          name: 'Unit 5: The Modern World (c. 1900–Present)',
          description: 'World wars, decolonization, and globalization',
          type: 'content',
          objectives: [
            { label: 'A', text: 'World Wars and Crisis of European Order', description: 'Explains causes of World War I using multiple factors' },
            { label: 'B', text: 'Decolonization and the Cold War', description: 'Describes decolonization movements in Asia and Africa after 1945' },
            { label: 'C', text: 'Globalization and Contemporary Challenges', description: 'Describes key features of economic globalization since 1945' },
          ],
        },
      ],
    },
    {
      name: 'AP World History',
      department: 'Humanities Department',
      gradeLevel: '10',
      code: 'aw-hs',
      skillStandards: [
        {
          code: 'aw-hts',
          name: 'Historical Thinking Skills',
          description: 'Apply across all units — foundational AP-level skills',
          type: 'skill',
          objectives: [
            { label: 'A', text: 'Causation (HTS-1)', description: 'Identifies proximate and distal causes without post hoc reasoning' },
            { label: 'B', text: 'Continuity and Change Over Time (HTS-2)', description: 'Identifies specific changes and continuities within a defined period' },
            { label: 'C', text: 'Comparison (HTS-3)', description: 'Compares developments across at least two world regions with accuracy' },
          ],
        },
      ],
      contentStandards: [
        {
          code: 'aw-1',
          name: 'Unit 1: The Global Tapestry (c. 1200–c. 1450)',
          description: 'East Asia, Dar al-Islam, Africa, Americas, and Europe',
          type: 'content',
          objectives: [
            { label: 'A', text: 'Developments in East Asia', description: 'Describes political, economic, and cultural features of Song and Yuan China' },
            { label: 'B', text: 'Dar al-Islam and Cross-Cultural Exchange', description: 'Describes geographic extent and cultural achievements of Islamic world' },
            { label: 'C', text: 'Africa, Americas, and Europe c. 1200–1450', description: 'Describes political and economic organization of major civilizations' },
          ],
        },
        {
          code: 'aw-2',
          name: 'Unit 2: Networks of Exchange (c. 1200–c. 1450)',
          description: 'Silk Roads, Indian Ocean, and trans-Saharan networks',
          type: 'content',
          objectives: [
            { label: 'A', text: 'The Silk Roads', description: 'Describes routes, commodities, and participants in Silk Road trade' },
            { label: 'B', text: 'The Indian Ocean Network', description: 'Describes geographic, technological, and commercial features of Indian Ocean trade' },
            { label: 'C', text: 'Trans-Saharan Trade Network', description: 'Describes commodities, routes, and participants in trans-Saharan trade' },
          ],
        },
        {
          code: 'aw-3',
          name: 'Unit 3: Land-Based Empires (c. 1450–c. 1750)',
          description: 'Ottoman, Safavid, Mughal empires and their impacts',
          type: 'content',
          objectives: [
            { label: 'A', text: 'Ottoman and Safavid Empires', description: 'Describes formation, expansion, and key features of Ottoman and Safavid empires' },
            { label: 'B', text: 'Mughal Empire and South Asian Development', description: 'Describes Mughal governance, culture, and religious policies' },
            { label: 'C', text: 'Eurasian Land Networks', description: 'Explains how land-based empires controlled and benefited from trade networks' },
          ],
        },
        {
          code: 'aw-4',
          name: 'Unit 4: Transoceanic Interconnections (c. 1450–c. 1650)',
          description: 'European exploration, colonization, and global impact',
          type: 'content',
          objectives: [
            { label: 'A', text: 'Causes of European Exploration', description: 'Explains motivations and technological developments for European exploration' },
            { label: 'B', text: 'Columbian Exchange and Colonization', description: 'Describes demographic and ecological consequences of European colonization' },
            { label: 'C', text: 'Resistance and Adaptation', description: 'Explains indigenous responses to European colonization' },
          ],
        },
        {
          code: 'aw-5',
          name: 'Unit 5: Interactions and Tensions (c. 1600–c. 1750)',
          description: 'Commercial, cultural, and political developments',
          type: 'content',
          objectives: [
            { label: 'A', text: 'Absolute Monarchy and State Power', description: 'Describes development of absolute monarchy in Europe' },
            { label: 'B', text: 'Developments in Eastern Europe and Russia', description: 'Describes rise of Russia and Eastern European state formation' },
            { label: 'C', text: 'Global Commerce and Competition', description: 'Explains European competition for colonial territories and trade dominance' },
          ],
        },
      ],
    },
    {
      name: 'AP Seminar',
      department: 'Humanities Department',
      gradeLevel: '11',
      code: 'as-ap',
      skillStandards: [
        {
          code: 'as-q',
          name: 'Questioning and Exploring',
          description: 'Develop research questions and explore topics',
          type: 'skill',
          objectives: [
            { label: 'A', text: 'Develop clear research questions', description: 'Formulates questions that are specific and arguable' },
            { label: 'B', text: 'Explore multiple perspectives', description: 'Identifies and evaluates diverse viewpoints on the topic' },
            { label: 'C', text: 'Gather preliminary sources', description: 'Locates and begins evaluating potential sources' },
          ],
        },
      ],
      contentStandards: [
        {
          code: 'as-1',
          name: 'Question and Explore',
          description: 'Develop initial understanding and direction',
          type: 'content',
          objectives: [
            { label: 'A', text: 'Identify the scenario', description: 'Understands context and constraints of the research scenario' },
            { label: 'B', text: 'Evaluate sources', description: 'Assesses reliability, credibility, and relevance of sources' },
            { label: 'C', text: 'Understand the audience', description: 'Identifies intended audience and how to address their interests' },
          ],
        },
        {
          code: 'as-2',
          name: 'Understand and Analyze',
          description: 'Develop deeper understanding and identify patterns',
          type: 'content',
          objectives: [
            { label: 'A', text: 'Identify main ideas', description: 'Accurately summarizes key claims and evidence' },
            { label: 'B', text: 'Understand perspectives', description: 'Explains multiple viewpoints and their underlying assumptions' },
            { label: 'C', text: 'Analyze evidence quality', description: 'Evaluates strength, relevance, and bias of evidence' },
          ],
        },
        {
          code: 'as-3',
          name: 'Evaluate Multiple Perspectives',
          description: 'Synthesize information and form reasoned judgments',
          type: 'content',
          objectives: [
            { label: 'A', text: 'Compare perspectives', description: 'Identifies similarities and differences between viewpoints' },
            { label: 'B', text: 'Assess credibility', description: 'Evaluates which perspectives are most credible and why' },
            { label: 'C', text: 'Develop informed position', description: 'Forms a reasoned position supported by evidence' },
          ],
        },
        {
          code: 'as-4',
          name: 'Synthesize Ideas',
          description: 'Create and communicate meaningful conclusions',
          type: 'content',
          objectives: [
            { label: 'A', text: 'Organize findings', description: 'Structures argument around a clear claim' },
            { label: 'B', text: 'Support conclusions', description: 'Uses evidence effectively to support claims' },
            { label: 'C', text: 'Address counterarguments', description: 'Acknowledges and addresses alternative perspectives' },
          ],
        },
      ],
    },
    {
      name: 'AP US History',
      department: 'Humanities Department',
      gradeLevel: '11',
      code: 'auh-ap',
      skillStandards: [
        {
          code: 'auh-hts',
          name: 'Historical Thinking Skills',
          description: 'Apply across all periods of US history',
          type: 'skill',
          objectives: [
            { label: 'A', text: 'Developments and Processes', description: 'Explains historical developments over time' },
            { label: 'B', text: 'Claims and Evidence', description: 'Develops historically defensible claims supported by evidence' },
            { label: 'C', text: 'Contextualization', description: 'Places historical developments in broader context' },
          ],
        },
      ],
      contentStandards: [
        {
          code: 'auh-1',
          name: 'Period 1: European Contact to Confederation (1491–1607)',
          description: 'Native American societies and early European exploration',
          type: 'content',
          objectives: [
            { label: 'A', text: 'Native American Societies', description: 'Describes characteristics of diverse Native American societies before European contact' },
            { label: 'B', text: 'European Exploration', description: 'Explains motivations for and impacts of European exploration' },
            { label: 'C', text: 'Early Colonization Attempts', description: 'Analyzes early European settlement efforts and their challenges' },
          ],
        },
        {
          code: 'auh-2',
          name: 'Period 2: Colonial Period (1607–1754)',
          description: 'Development of British colonies in North America',
          type: 'content',
          objectives: [
            { label: 'A', text: 'Colonial Establishment', description: 'Describes founding and development of British colonies' },
            { label: 'B', text: 'Colonial Economies and Slavery', description: 'Explains regional economic systems and role of slavery' },
            { label: 'C', text: 'Colonial Societies', description: 'Analyzes social structures and cultural development in colonies' },
          ],
        },
        {
          code: 'auh-3',
          name: 'Period 3: Revolution and Early Republic (1754–1800)',
          description: 'American Revolution and formation of new nation',
          type: 'content',
          objectives: [
            { label: 'A', text: 'Causes of Revolution', description: 'Identifies and explains causes of American Revolution' },
            { label: 'B', text: 'Declaration and War', description: 'Explains Declaration of Independence and conduct of Revolutionary War' },
            { label: 'C', text: 'New Government', description: 'Analyzes formation and early operation of US government' },
          ],
        },
        {
          code: 'auh-4',
          name: 'Period 4: Expansion (1800–1848)',
          description: 'Westward expansion and territorial growth',
          type: 'content',
          objectives: [
            { label: 'A', text: 'Manifest Destiny', description: 'Explains ideology and consequences of westward expansion' },
            { label: 'B', text: 'Native American Removal', description: 'Analyzes Indian Removal Act and its impacts' },
            { label: 'C', text: 'Regional Development', description: 'Compares development of North, South, and West' },
          ],
        },
        {
          code: 'auh-5',
          name: 'Period 5: Civil War and Reconstruction (1844–1877)',
          description: 'Sectional conflict, Civil War, and Reconstruction',
          type: 'content',
          objectives: [
            { label: 'A', text: 'Causes of Civil War', description: 'Explains tensions over slavery leading to secession' },
            { label: 'B', text: 'Civil War', description: 'Describes military, political, and social aspects of the war' },
            { label: 'C', text: 'Reconstruction', description: 'Analyzes Reconstruction policies and their outcomes' },
          ],
        },
      ],
    },
    {
      name: 'AP US Government and Politics',
      department: 'Humanities Department',
      gradeLevel: '12',
      code: 'aug-ap',
      skillStandards: [
        {
          code: 'aug-principles',
          name: 'Government Principles',
          description: 'Understand structures and principles of US government',
          type: 'skill',
          objectives: [
            { label: 'A', text: 'Constitutional Framework', description: 'Explains key principles of US Constitution' },
            { label: 'B', text: 'Separation of Powers', description: 'Describes structure and function of three branches' },
            { label: 'C', text: 'Federalism', description: 'Explains division of power between federal and state governments' },
          ],
        },
      ],
      contentStandards: [
        {
          code: 'aug-1',
          name: 'Unit 1: Constitutional Foundations',
          description: 'Founding documents and basic principles',
          type: 'content',
          objectives: [
            { label: 'A', text: 'Articles of Confederation', description: 'Describes limitations of Articles of Confederation' },
            { label: 'B', text: 'Constitution and Bill of Rights', description: 'Explains major provisions of Constitution and Bill of Rights' },
            { label: 'C', text: 'Federalist Papers', description: 'Understands arguments for ratification in Federalist Papers' },
          ],
        },
        {
          code: 'aug-2',
          name: 'Unit 2: Legislative Branch',
          description: 'Structure, powers, and process of Congress',
          type: 'content',
          objectives: [
            { label: 'A', text: 'Congressional Structure', description: 'Describes composition and organization of House and Senate' },
            { label: 'B', text: 'Legislative Powers', description: 'Explains enumerated and implied powers of Congress' },
            { label: 'C', text: 'Legislative Process', description: 'Describes how bills become laws' },
          ],
        },
        {
          code: 'aug-3',
          name: 'Unit 3: Executive and Judicial Branches',
          description: 'Presidency, bureaucracy, and courts',
          type: 'content',
          objectives: [
            { label: 'A', text: 'Executive Branch', description: 'Describes powers and responsibilities of President' },
            { label: 'B', text: 'Federal Bureaucracy', description: 'Explains structure and function of federal agencies' },
            { label: 'C', text: 'Judicial System', description: 'Describes structure and role of federal courts' },
          ],
        },
        {
          code: 'aug-4',
          name: 'Unit 4: Individual Rights and Liberties',
          description: 'Bill of Rights and civil liberties',
          type: 'content',
          objectives: [
            { label: 'A', text: 'First Amendment Rights', description: 'Explains protections for speech, religion, assembly, petition' },
            { label: 'B', text: 'Due Process Rights', description: 'Describes protections in criminal justice system' },
            { label: 'C', text: 'Equal Protection', description: 'Explains equal protection guarantees' },
          ],
        },
      ],
    },
  ],
};

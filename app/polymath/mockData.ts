export type ArticleType = 'expertise' | 'tool' | 'resource' | 'spotlight';

export interface Article {
  id: string;
  type: ArticleType;
  title: string;
  description: string;
  author: string;
  date: string;
  readTime: string;
  emoji: string;
  body?: string;
  imageUrl?: string;
  organization?: string;
  tags?: string[];
}

export const FEATURED_ARTICLES: Article[] = [
  {
    id: '1',
    type: 'expertise',
    title: 'How to Get Into Woodworking',
    description: 'A three-part journey from hobby to mastery',
    author: 'Sarah Chen',
    date: 'June 2026',
    readTime: '8 min read',
    emoji: '🪵',
    organization: 'Craftspeople Collective',
    tags: ['woodworking', 'skill-building', 'hands-on'],
    body: `Woodworking is an ancient craft that combines technical skill with creative vision. Whether you're drawn to furniture making, instrument building, or home renovation, the journey begins with understanding the fundamentals...`,
  },
  {
    id: '2',
    type: 'resource',
    title: 'AP US History Unit 1 Lesson Plans',
    description: 'Complete 4-week curriculum for Period 1',
    author: 'Match Charter High School',
    date: 'August 2026',
    readTime: '12 lessons',
    emoji: '📚',
    organization: 'Match Charter High School',
    tags: ['us-history', 'ap-curriculum', 'lesson-plans'],
    body: `This comprehensive unit covers the period before Columbus through the early colonial period. Includes detailed lesson plans, primary source documents, and assessment materials...`,
  },
  {
    id: '3',
    type: 'tool',
    title: 'El Lector Diario — Spanish Learning',
    description: 'Daily Spanish reader with audio and vocabulary',
    author: 'Language Lab',
    date: 'July 2026',
    readTime: 'Interactive tool',
    emoji: '🌐',
    organization: 'Language Lab',
    tags: ['spanish', 'language-learning', 'interactive'],
    body: `An immersive daily reading tool for Spanish learners at B1-B2 levels. Includes pronunciation audio, vocabulary flashcards, and comprehension quizzes...`,
  },
  {
    id: '4',
    type: 'spotlight',
    title: 'Building a Sustainable Food System',
    description: 'Resources from urban farming communities',
    author: 'Community Garden Coalition',
    date: 'June 2026',
    readTime: '23 resources',
    emoji: '🌱',
    organization: 'Community Garden Coalition',
    tags: ['sustainability', 'agriculture', 'community'],
    body: `Explore how communities are transforming food systems through urban farming, permaculture, and cooperative models...`,
  },
  {
    id: '5',
    type: 'expertise',
    title: 'The Science of Habit Formation',
    description: 'Understanding behavioral change and habit loops',
    author: 'Dr. James Morrison',
    date: 'July 2026',
    readTime: '10 min read',
    emoji: '🧠',
    organization: 'Behavioral Research Institute',
    tags: ['psychology', 'habits', 'behavior-change'],
    body: `Habits are neural pathways formed through repetition. Learn the science behind why habits stick and how to leverage them for positive change...`,
  },
  {
    id: '6',
    type: 'resource',
    title: 'Shakespeare Sonnets Annotation Guide',
    description: 'Interactive annotations for all 154 sonnets',
    author: 'Literature Academy',
    date: 'August 2026',
    readTime: '154 sonnets',
    emoji: '✍️',
    organization: 'Literature Academy',
    tags: ['shakespeare', 'poetry', 'literature'],
    body: `A comprehensive guide to understanding Shakespeare's sonnets with line-by-line annotations, historical context, and modern analysis...`,
  },
  {
    id: '7',
    type: 'tool',
    title: 'Data Visualization Studio',
    description: 'Create compelling charts and graphs with ease',
    author: 'Analytics Platform',
    date: 'June 2026',
    readTime: 'Interactive tool',
    emoji: '📊',
    organization: 'Analytics Platform',
    tags: ['data-visualization', 'analytics', 'tool'],
    body: `A user-friendly tool for creating professional data visualizations without coding. Perfect for educators and students...`,
  },
  {
    id: '8',
    type: 'expertise',
    title: 'Improv Techniques for Teaching',
    description: 'Using improvisation to create dynamic classrooms',
    author: 'Kyle Winslow Smith',
    date: 'August 2026',
    readTime: '6 min read',
    emoji: '🎭',
    organization: 'Creative Learning Collective',
    tags: ['improv', 'pedagogy', 'classroom-engagement'],
    body: `Improvisation isn't just for comedy. Learn how improv principles can transform your teaching and student engagement...`,
  },
  {
    id: '9',
    type: 'resource',
    title: 'AP Biology Lab Manual',
    description: '14 recommended labs with protocols and data sheets',
    author: 'Science Education Consortium',
    date: 'July 2026',
    readTime: '14 labs',
    emoji: '🔬',
    organization: 'Science Education Consortium',
    tags: ['biology', 'ap-curriculum', 'lab-work'],
    body: `Comprehensive lab manual covering all major AP Biology topics with detailed protocols, equipment lists, and assessment rubrics...`,
  },
  {
    id: '10',
    type: 'spotlight',
    title: 'Global Climate Action Projects',
    description: 'Student-led initiatives addressing climate change',
    author: 'Youth Climate Alliance',
    date: 'June 2026',
    readTime: '31 projects',
    emoji: '🌍',
    organization: 'Youth Climate Alliance',
    tags: ['climate', 'student-projects', 'activism'],
    body: `Inspiring climate action projects from students around the world, complete with implementation guides and impact metrics...`,
  },
  {
    id: '11',
    type: 'expertise',
    title: 'Mastering the Personal Essay',
    description: 'Craft compelling narratives that captivate readers',
    author: 'Margaret Johnson',
    date: 'July 2026',
    readTime: '9 min read',
    emoji: '📖',
    organization: 'Writing Center',
    tags: ['writing', 'essays', 'narrative'],
    body: `The personal essay is a powerful tool for self-expression and learning. Discover the techniques used by master essayists...`,
  },
  {
    id: '12',
    type: 'tool',
    title: 'Collaborative Whiteboard Platform',
    description: 'Real-time brainstorming and design tool',
    author: 'Creative Tech',
    date: 'August 2026',
    readTime: 'Interactive tool',
    emoji: '✏️',
    organization: 'Creative Tech',
    tags: ['collaboration', 'brainstorming', 'design'],
    body: `A web-based whiteboard tool for real-time collaboration, perfect for classrooms and creative teams...`,
  },
];

export interface RelatedArticle {
  id: string;
  title: string;
  author: string;
  readTime: string;
  source?: string;
}

export const RELATED_ARTICLES: RelatedArticle[] = [
  {
    id: '11',
    title: 'Mastering the Personal Essay',
    author: 'Margaret Johnson',
    readTime: '9 min',
    source: 'Writing Center',
  },
  {
    id: '5',
    title: 'The Science of Habit Formation',
    author: 'Dr. James Morrison',
    readTime: '10 min',
    source: 'Behavioral Research',
  },
  {
    id: '7',
    title: 'Data Visualization Studio',
    author: 'Analytics Platform',
    readTime: '12 min',
    source: 'Analytics Collective',
  },
];

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'tool' | 'guide';
  icon: string;
}

export const RECOMMENDED_RESOURCES: Resource[] = [
  {
    id: 'r1',
    title: 'Complete Woodworking Toolkit',
    description: 'Essential tools and materials guide for beginners',
    type: 'guide',
    icon: '📋',
  },
  {
    id: 'r2',
    title: 'Project Templates & Plans',
    description: 'Free downloadable plans for 50+ beginner projects',
    type: 'document',
    icon: '📄',
  },
  {
    id: 'r3',
    title: 'Workshop Video Series',
    description: 'Step-by-step video tutorials from master craftspeople',
    type: 'video',
    icon: '🎥',
  },
];

export interface Author {
  name: string;
  bio: string;
  avatar?: string;
}

export const ARTICLE_AUTHOR: Author = {
  name: 'Sarah Chen',
  bio: 'Sarah is a master woodworker and educator with 15 years of experience. She founded the Craftspeople Collective to make woodworking accessible to everyone.',
  avatar: '👩‍🎓',
};

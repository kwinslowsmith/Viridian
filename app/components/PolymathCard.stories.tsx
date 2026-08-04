import type { Meta, StoryObj } from '@storybook/react';
import { PolymathCard } from './PolymathCard';

const meta = {
  title: 'Polymath/Card',
  component: PolymathCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PolymathCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Expertise Series Card
export const ExpertiseSeries: Story = {
  args: {
    type: 'expertise',
    title: 'How to Get Into Woodworking',
    description: 'A three-part journey from hobby to mastery',
    author: 'Sarah Chen',
    readTime: '8 min read',
    emoji: '🪵',
    metadata: 'Sarah Chen | 8 min read',
    ctaText: 'Read Article',
  },
};

// Tool Card
export const Tool: Story = {
  args: {
    type: 'tool',
    title: 'El Lector Diario — Spanish Learning',
    description: 'Daily Spanish reader with audio and vocabulary',
    author: 'Language Lab',
    emoji: '🌐',
    metadata: 'Language Lab | Interactive',
    ctaText: 'Open Tool',
  },
};

// Resource Card
export const Resource: Story = {
  args: {
    type: 'resource',
    title: 'AP US History Unit 1 Lesson Plans',
    description: 'Complete 4-week curriculum for Period 1',
    author: 'Match Charter High School',
    emoji: '📚',
    metadata: 'Match Charter High School | 12 lessons',
    ctaText: 'View Resource',
  },
};

// Spotlight Card
export const Spotlight: Story = {
  args: {
    type: 'spotlight',
    title: 'Building a Sustainable Food System',
    description: 'Resources from urban farming communities',
    author: 'Community Garden Coalition',
    emoji: '🌱',
    metadata: 'Community Garden Coalition | 23 resources',
    ctaText: 'Explore Spotlight',
  },
};

// Saved Card State
export const Saved: Story = {
  args: {
    type: 'expertise',
    title: 'How to Get Into Woodworking',
    description: 'A three-part journey from hobby to mastery',
    author: 'Sarah Chen',
    emoji: '🪵',
    metadata: 'Sarah Chen | 8 min read',
    isSaved: true,
  },
};

// Card without Description
export const WithoutDescription: Story = {
  args: {
    type: 'tool',
    title: 'Data Visualization Studio',
    author: 'Analytics Platform',
    emoji: '📊',
    metadata: 'Analytics Platform | Interactive',
  },
};

// Card Grid
export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
      <PolymathCard
        type="expertise"
        title="How to Get Into Woodworking"
        description="A three-part journey from hobby to mastery"
        author="Sarah Chen"
        readTime="8 min read"
        emoji="🪵"
        metadata="Sarah Chen | 8 min read"
      />
      <PolymathCard
        type="resource"
        title="AP US History Unit 1 Lesson Plans"
        description="Complete 4-week curriculum for Period 1"
        author="Match Charter High School"
        emoji="📚"
        metadata="Match Charter High School | 12 lessons"
      />
      <PolymathCard
        type="tool"
        title="El Lector Diario — Spanish Learning"
        description="Daily Spanish reader with audio and vocabulary"
        author="Language Lab"
        emoji="🌐"
        metadata="Language Lab | Interactive"
      />
      <PolymathCard
        type="spotlight"
        title="Building a Sustainable Food System"
        description="Resources from urban farming communities"
        author="Community Garden Coalition"
        emoji="🌱"
        metadata="Community Garden Coalition | 23 resources"
      />
      <PolymathCard
        type="expertise"
        title="The Science of Habit Formation"
        description="Understanding behavioral change and habit loops"
        author="Dr. James Morrison"
        emoji="🧠"
        metadata="Dr. James Morrison | 10 min read"
      />
      <PolymathCard
        type="resource"
        title="Shakespeare Sonnets Annotation Guide"
        description="Interactive annotations for all 154 sonnets"
        author="Literature Academy"
        emoji="✍️"
        metadata="Literature Academy | 154 sonnets"
      />
    </div>
  ),
};

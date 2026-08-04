import type { Meta, StoryObj } from '@storybook/react';
import { PolymathButton } from './PolymathButton';

const meta = {
  title: 'Polymath/Button',
  component: PolymathButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PolymathButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Primary Button
export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Start Exploring',
  },
};

export const PrimaryHover: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Start Exploring',
  },
  parameters: {
    pseudo: { hover: true },
  },
};

export const PrimaryDisabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Start Exploring',
    disabled: true,
  },
};

// Secondary Button
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    children: 'Learn More',
  },
};

// Tertiary Button
export const Tertiary: Story = {
  args: {
    variant: 'tertiary',
    size: 'md',
    children: 'Browse',
  },
};

// Size Variations
export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    children: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: 'Large Button',
  },
};

// Full Width
export const FullWidth: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Full Width Button',
    isFullWidth: true,
  },
};

// With Icon
export const WithIcon: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: (
      <>
        <span>→</span>
        Next
      </>
    ),
  },
};

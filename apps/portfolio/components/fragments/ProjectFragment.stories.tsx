import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProjectFragment } from './ProjectFragment';

const meta = {
  title: 'Fragments/ProjectFragment',
  component: ProjectFragment,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ProjectFragment>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockProject = {
  _id: "p1",
  title: "Cyberpunk Core",
  slug: { current: "cyberpunk-core" },
  description: "A high-performance system built with React, Framer Motion, and Tailwind CSS. Features an interactive grid system and cinematic fragments.",
  techStack: [
    { _id: "t1", name: "Next.js", proficiency: 100, category: "Frontend" },
    { _id: "t2", name: "TypeScript", proficiency: 100, category: "Language" },
    { _id: "t3", name: "Tailwind", proficiency: 100, category: "Frontend" }
  ],
  externalLink: "https://github.com",
  isFeatured: true,
};

export const Default: Story = {
  args: {
    project: mockProject,
    index: 0
  },
  render: (args) => (
    <div className="bg-void min-h-screen text-white">
      <ProjectFragment {...args} />
    </div>
  ),
};

export const SecondIndex: Story = {
  args: {
    project: {
      ...mockProject,
      title: "Project Zero",
      slug: { current: "project-zero" },
      description: "An experimental rendering engine utilizing custom shaders and complex data structures.",
    },
    index: 1
  },
  render: (args) => (
    <div className="bg-void min-h-screen text-white">
      <ProjectFragment {...args} />
    </div>
  ),
};
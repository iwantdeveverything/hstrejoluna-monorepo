import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProjectsOverview } from './ProjectsOverview';
import { LazyMotion, domAnimation } from 'framer-motion';

const meta = {
  title: 'Fragments/ProjectsOverview',
  component: ProjectsOverview,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <LazyMotion features={domAnimation}>
        <div className="bg-void min-h-screen text-white p-4 md:p-8">
          <Story />
        </div>
      </LazyMotion>
    )
  ]
} satisfies Meta<typeof ProjectsOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockProjects = [
  {
    _id: "p1",
    title: "Quantum Core",
    slug: { current: "quantum-core" },
    description: "Distributed state management for high-availability systems with sub-millisecond replication.",
    techStack: [
      { _id: "t1", name: "Rust", proficiency: 100, category: "Backend" },
      { _id: "t2", name: "gRPC", proficiency: 100, category: "Backend" },
    ],
    externalLink: "https://example.com/quantum",
  },
  {
    _id: "p2",
    title: "Neon Nexus",
    slug: { current: "neon-nexus" },
    description: "An interactive dataviz dashboard projecting real-time telemetry from IoT edge devices.",
    techStack: [
      { _id: "t3", name: "React", proficiency: 100, category: "Frontend" },
      { _id: "t4", name: "D3.js", proficiency: 100, category: "Frontend" },
    ],
  },
  {
    _id: "p3",
    title: "Project Zero",
    slug: { current: "project-zero" },
    description: "Zero-knowledge proof authentication gateway.",
    techStack: [
      { _id: "t5", name: "Solidity", proficiency: 100, category: "Smart Contract" },
    ],
    micrositePath: "/projects/zero",
  },
];

export const Default: Story = {
  args: {
    projects: mockProjects,
  }
};

export const SingleProject: Story = {
  args: {
    projects: [mockProjects[0]],
  }
};
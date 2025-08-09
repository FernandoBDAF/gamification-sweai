# AI Learning Graph

Interactive, gamified tech tree for your AI-era SWE roadmap built with Next.js 14, React Flow, and Tailwind CSS.

## Features

- **Interactive Tech Tree**: Visual graph of AI/ML learning topics with dependencies
- **Gamification**: XP points, levels, daily streaks, and cluster badges
- **Progress Tracking**: Mark topics as completed and track your learning journey
- **Filtering & Search**: Filter by cluster, hide completed topics, search by name
- **Goal Setting**: Set learning goals and highlight dependency paths
- **Data Export/Import**: Save and restore your progress
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd my-ai-learning-graph
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **React Flow** - Interactive node-based graphs
- **Framer Motion** - Smooth animations and interactions
- **Lucide React** - Beautiful icons

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and Tailwind utilities
│   ├── layout.tsx         # Root layout component
│   └── page.tsx          # Home page
├── components/            # React components
│   └── AILearningGraph.tsx # Main graph component
├── lib/                   # Utility libraries
│   └── gamification.ts   # Progress tracking and XP system
├── data/                  # Static data
│   └── graphData.json    # Learning topics and dependencies
└── public/               # Static assets
```

## Learning Clusters

The learning graph is organized into 10 clusters:

1. **AI Era & Roles** - Understanding AI's impact on software architecture
2. **Agents & Protocols** - AI agents and communication patterns
3. **Design Patterns** - Architectural patterns for AI systems
4. **Caching** - Caching strategies for AI applications
5. **Security** - AI-specific security considerations
6. **Prompt & Context** - Effective prompt engineering
7. **System Design** - Scalable AI system architecture
8. **Observability** - Monitoring and debugging AI systems
9. **Testing & QA** - Quality assurance for AI applications
10. **Cost Control** - Managing AI infrastructure costs

## Customization

### Adding New Topics

Edit `data/graphData.json` to add new learning topics:

```json
{
  "id": "C1_A6",
  "label": "Your new topic",
  "cluster": "C1",
  "xp": 15,
  "deps": ["C1_A1", "C1_A2"]
}
```

### Modifying Clusters

Update the `clusterLabels` and `clusterColors` objects in `components/AILearningGraph.tsx`.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by skill trees in video games
- Built for the modern AI-era software engineer
- Designed to make learning interactive and engaging

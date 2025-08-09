import AILearningGraph from "@/components/AILearningGraph";

export default function Page() {
  return (
    <main className="max-w-[1600px] mx-auto p-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-1">AI Learning Graph</h1>
      <p className="text-neutral-600 mb-6">
        Interactive, gamified tech tree for your AI-era SWE roadmap
      </p>
      <AILearningGraph />
    </main>
  );
}

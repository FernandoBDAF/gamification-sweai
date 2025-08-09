import AILearningGraph from "@/components/AILearningGraph";

export default function Page() {
  return (
    <main className="flex-1 min-h-0 flex flex-col">
      {/* Compact Top Navigation Bar with Title and Controls */}
      <nav className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Title and Description */}
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  AI Learning Graph
                </h1>
                <p className="text-xs text-gray-600">
                  Interactive, gamified tech tree for your AI-era SWE roadmap
                </p>
              </div>
            </div>
            {/* Right: Branding */}
            <div className="flex items-center space-x-4">
              <div className="text-xs text-gray-500 flex items-center">
                <span className="mr-1">🎮</span>
                <span className="hidden sm:inline">
                  Civilization-inspired learning
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Full Screen Layout with Integrated Sidebar */}
      <section className="relative flex-1 min-h-0">
        <AILearningGraph />
      </section>
    </main>
  );
}

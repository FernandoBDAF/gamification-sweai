import "./globals.css";

export const metadata = {
  title: "AI Learning Graph",
  description: "Interactive, gamified tech tree for your AI-era SWE roadmap",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Lock the app to the viewport and prevent horizontal scroll bleed */}
      <body className="flex h-dvh w-dvw overflow-hidden flex-col bg-neutral-50 text-neutral-900">
        {children}
      </body>
    </html>
  );
}

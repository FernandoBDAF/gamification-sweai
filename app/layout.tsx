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
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        {children}
      </body>
    </html>
  );
}

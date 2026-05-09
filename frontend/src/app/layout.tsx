import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@copilotkit/react-ui/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Insurance Claim Copilot",
  description: "AI-powered insurance claim filing assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CopilotKit runtimeUrl="/api/copilotkit">
          <CopilotSidebar
            defaultOpen={true}
            labels={{
              title: "Insurance Copilot",
              placeholder: "Describe what happened...",
            }}
          >
            {children}
          </CopilotSidebar>
        </CopilotKit>
      </body>
    </html>
  );
}

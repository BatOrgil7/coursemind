import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hyntor - Don't just get the answer. Actually learn it.",
  description:
    "A responsible-AI study platform: a Socratic tutor grounded in your own course materials, auto-generated practice quizzes, and pre-submit code review that makes you better - not dependent.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}

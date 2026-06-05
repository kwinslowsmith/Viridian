"use client";

import React, { useState } from "react";
import { colors } from "@/app/modules/improv/design/colors";

export default function Home() {
  const [role, setRole] = useState<"teacher" | "student" | null>(null);

  if (role === "teacher") {
    return (
      <main className="min-h-screen" style={{ backgroundColor: colors.bg }}>
        <div className="max-w-2xl mx-auto p-4 md:p-8">
          <div className="text-center mb-8 md:mb-12">
            <h1
              className="text-3xl md:text-4xl font-serif font-bold mb-2"
              style={{ color: colors.text }}
            >
              Viridian
            </h1>
            <p className="text-base md:text-lg" style={{ color: colors.text2 }}>
              Improv Mastery Tracker — Teacher Dashboard
            </p>
          </div>

          <div
            className="rounded-xl border p-6 md:p-8"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <h2
              className="text-xl md:text-2xl font-serif font-bold mb-4"
              style={{ color: colors.text }}
            >
              Getting Started
            </h2>
            <p className="mb-6" style={{ color: colors.text }}>
              The Viridian frontend is fully built and ready to integrate with the Archon backend API.
            </p>

            <div className="space-y-3 mb-6">
              <h3
                className="font-semibold text-base md:text-lg"
                style={{ color: colors.text }}
              >
                Components Built:
              </h3>
              <ul
                className="space-y-2 text-sm md:text-base"
                style={{ color: colors.text }}
              >
                <li>✓ ClassList, ClassDetail, WeekDetail (teacher workflow)</li>
                <li>✓ StudentPicker, StudentDashboard, SkillDetail (student workflow)</li>
                <li>✓ StudentSelfRatingForm, TeacherRatingForm, FeedbackForm</li>
                <li>✓ AssessmentLog component</li>
                <li>✓ Custom hooks for data fetching and mutations</li>
                <li>✓ Type-safe API client with retry logic</li>
                <li>✓ Tailwind CSS design system</li>
              </ul>
            </div>

            <div className="space-y-3 mb-6">
              <h3
                className="font-semibold text-base md:text-lg"
                style={{ color: colors.text }}
              >
                Documentation:
              </h3>
              <ul
                className="space-y-2 text-sm md:text-base"
                style={{ color: colors.text2 }}
              >
                <li>→ docs/frontend/COMPONENTS.md - Full component documentation</li>
                <li>→ README-FRONTEND.md - Frontend architecture guide</li>
                <li>→ lib/api/endpoints.ts - All API functions</li>
                <li>→ lib/types/index.ts - TypeScript definitions</li>
              </ul>
            </div>

            <div className="space-y-3 mb-8">
              <h3
                className="font-semibold text-base md:text-lg"
                style={{ color: colors.text }}
              >
                Next Steps:
              </h3>
              <ol
                className="space-y-2 text-sm md:text-base list-decimal list-inside"
                style={{ color: colors.text }}
              >
                <li>Start the Archon backend API</li>
                <li>Update API endpoint URLs in lib/api/endpoints.ts</li>
                <li>Create pages that use the components (example in progress)</li>
                <li>Test the complete teacher and student workflows</li>
                <li>Deploy to production</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRole(null)}
                className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm md:text-base transition-all"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                }}
              >
                Back
              </button>
              <a
                href="https://github.com/kwinslowsmith/Viridian"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm md:text-base transition-all text-center"
                style={{
                  backgroundColor: colors.amber.bg,
                  color: colors.amber.text,
                  border: `1px solid ${colors.amber.border}`,
                }}
              >
                View GitHub
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (role === "student") {
    return (
      <main className="min-h-screen" style={{ backgroundColor: colors.bg }}>
        <div className="max-w-2xl mx-auto p-4 md:p-8">
          <div className="text-center mb-8 md:mb-12">
            <h1
              className="text-3xl md:text-4xl font-serif font-bold mb-2"
              style={{ color: colors.text }}
            >
              Viridian
            </h1>
            <p className="text-base md:text-lg" style={{ color: colors.text2 }}>
              Improv Mastery Tracker — Student Dashboard
            </p>
          </div>

          <div
            className="rounded-xl border p-6 md:p-8"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <h2
              className="text-xl md:text-2xl font-serif font-bold mb-4"
              style={{ color: colors.text }}
            >
              Student Interface Ready
            </h2>
            <p className="mb-6" style={{ color: colors.text }}>
              All student-facing components have been built and are ready to display your learning progress, ratings, and instructor feedback.
            </p>

            <div className="space-y-3 mb-6">
              <h3
                className="font-semibold text-base md:text-lg"
                style={{ color: colors.text }}
              >
                Features Available:
              </h3>
              <ul
                className="space-y-2 text-sm md:text-base"
                style={{ color: colors.text }}
              >
                <li>✓ View your classes and select one</li>
                <li>✓ See your overall progress and mastery percentage</li>
                <li>✓ View detailed ratings for each skill</li>
                <li>✓ Read instructor feedback</li>
                <li>✓ Track revision history of your self-ratings</li>
                <li>✓ Identify skill areas to focus on</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p
                className="text-sm md:text-base"
                style={{ color: colors.text }}
              >
                Integration with Archon backend is required to see your actual class data, ratings, and feedback.
              </p>
            </div>

            <button
              onClick={() => setRole(null)}
              className="w-full px-4 py-2 rounded-lg font-semibold text-sm md:text-base transition-all"
              style={{
                backgroundColor: colors.amber.bg,
                color: colors.amber.text,
                border: `1px solid ${colors.amber.border}`,
              }}
            >
              Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
      <div className="w-full max-w-md p-4 md:p-8">
        <div className="text-center mb-8 md:mb-12">
          <h1
            className="text-4xl md:text-5xl font-serif font-bold mb-3"
            style={{ color: colors.text }}
          >
            Viridian
          </h1>
          <p className="text-base md:text-lg" style={{ color: colors.text2 }}>
            Improv Mastery Tracker
          </p>
          <p className="text-xs md:text-sm mt-2" style={{ color: colors.text3 }}>
            P1 Frontend — Fully Built and Ready
          </p>
        </div>

        <div className="space-y-3 md:space-y-4">
          <button
            onClick={() => setRole("teacher")}
            className="w-full p-6 rounded-xl border-2 text-left transition-all hover:shadow-md"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.amber.border,
            }}
          >
            <h2
              className="text-xl md:text-2xl font-serif font-bold mb-2"
              style={{ color: colors.text }}
            >
              Teacher
            </h2>
            <p className="text-sm md:text-base" style={{ color: colors.text2 }}>
              Rate student skills, provide feedback, manage assessments
            </p>
          </button>

          <button
            onClick={() => setRole("student")}
            className="w-full p-6 rounded-xl border-2 text-left transition-all hover:shadow-md"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.teal.border,
            }}
          >
            <h2
              className="text-xl md:text-2xl font-serif font-bold mb-2"
              style={{ color: colors.text }}
            >
              Student
            </h2>
            <p className="text-sm md:text-base" style={{ color: colors.text2 }}>
              View your progress, self-rate skills, read feedback
            </p>
          </button>
        </div>

        <div
          className="mt-8 md:mt-12 p-4 md:p-6 rounded-xl text-center"
          style={{
            backgroundColor: colors.bg,
            borderColor: colors.border,
          }}
        >
          <p className="text-xs md:text-sm" style={{ color: colors.text2 }}>
            Built with Next.js 16, React 19, TypeScript, React Query, and Tailwind CSS
          </p>
          <p className="text-xs mt-2" style={{ color: colors.text3 }}>
            All 10 components + 5 hooks + comprehensive documentation completed
          </p>
        </div>
      </div>
    </main>
  );
}

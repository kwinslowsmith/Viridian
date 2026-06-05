/**
 * WeekDetail Component
 * Shows week details with anchor skills prioritized, non-anchors collapsible
 * Lists all students for teacher rating workflow
 */

import React, { useState } from "react";
import { Class, Week, Skill, Student } from "@/lib/types";
import { colors } from "@/app/modules/improv/design/colors";

export interface WeekDetailProps {
  cls: Class;
  week: Week;
  students: Student[];
  anchorSkills: Skill[];
  nonAnchorSkills: Skill[];
  onBack: () => void;
  onSelectStudent: (studentId: string) => void;
  isLoading?: boolean;
}

export function WeekDetail({
  cls,
  week,
  students,
  anchorSkills,
  nonAnchorSkills,
  onBack,
  onSelectStudent,
  isLoading = false,
}: WeekDetailProps) {
  const [showNonAnchors, setShowNonAnchors] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <div className="p-4 md:p-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm font-medium"
          style={{ color: colors.amber.accent }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {cls.name}
        </button>

        {/* Week Header */}
        <div
          className="rounded-xl p-4 md:p-6 mb-6 md:mb-8 border flex items-center gap-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <div
            className="w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-lg"
            style={{
              backgroundColor: colors.amber.bg,
              borderColor: colors.amber.border,
              color: colors.amber.text,
              border: `1px solid ${colors.amber.border}`,
            }}
          >
            {week.weekNum}
          </div>
          <div>
            <h1
              className="text-2xl md:text-3xl font-serif font-bold"
              style={{ color: colors.text }}
            >
              {week.title || `Week ${week.weekNum}`}
            </h1>
          </div>
        </div>

        {/* Focus Areas */}
        {week.focusAreas && (
          <div
            className="rounded-xl p-4 md:p-6 mb-4 md:mb-6 border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <p
              className="text-xs uppercase tracking-wider font-semibold mb-2 md:mb-3"
              style={{ color: colors.text2 }}
            >
              Focus Areas
            </p>
            <p className="text-sm md:text-base" style={{ color: colors.text }}>
              {week.focusAreas}
            </p>
          </div>
        )}

        {/* Notes */}
        {week.notes && (
          <div
            className="rounded-xl p-4 md:p-6 mb-4 md:mb-6 border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <p
              className="text-xs uppercase tracking-wider font-semibold mb-2 md:mb-3"
              style={{ color: colors.text2 }}
            >
              Notes
            </p>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: colors.text }}>
              {week.notes}
            </p>
          </div>
        )}

        {/* Skills Section */}
        {(anchorSkills.length > 0 || nonAnchorSkills.length > 0) && (
          <div className="mb-6 md:mb-8">
            <h2
              className="text-lg md:text-xl font-serif font-bold mb-3 md:mb-4"
              style={{ color: colors.text }}
            >
              Skills for Assessment
            </h2>

            {/* Anchor Skills */}
            {anchorSkills.length > 0 && (
              <div
                className="rounded-xl overflow-hidden border mb-3 md:mb-4"
                style={{ borderColor: colors.border }}
              >
                <div
                  className="px-4 md:px-6 py-3 md:py-4 flex items-center gap-2"
                  style={{
                    backgroundColor: colors.teal.bg,
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                >
                  <span
                    className="text-lg md:text-xl"
                    style={{ color: colors.teal.accent }}
                  >
                    ◆
                  </span>
                  <span
                    className="font-semibold text-sm md:text-base"
                    style={{ color: colors.teal.text }}
                  >
                    Anchor Skills
                  </span>
                </div>
                <div className="px-4 md:px-6 py-3 md:py-4 space-y-2 md:space-y-3">
                  {anchorSkills.map((skill) => (
                    <div key={skill.id}>
                      <p
                        className="font-semibold text-sm md:text-base mb-1"
                        style={{ color: colors.text }}
                      >
                        {skill.name}
                      </p>
                      {skill.description && (
                        <p className="text-xs md:text-sm" style={{ color: colors.text2 }}>
                          {skill.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Non-Anchor Skills (Collapsible) */}
            {nonAnchorSkills.length > 0 && (
              <button
                onClick={() => setShowNonAnchors(!showNonAnchors)}
                className="w-full rounded-xl overflow-hidden border text-left transition-all"
                style={{ borderColor: colors.border }}
              >
                <div
                  className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between"
                  style={{
                    backgroundColor: colors.bg,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-lg md:text-xl"
                      style={{ color: colors.amber.accent }}
                    >
                      ◆
                    </span>
                    <span
                      className="font-semibold text-sm md:text-base"
                      style={{ color: colors.text }}
                    >
                      Other Skills ({nonAnchorSkills.length})
                    </span>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={colors.text2}
                    strokeWidth="2"
                    className={`transition-transform ${
                      showNonAnchors ? "rotate-180" : ""
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>

                {showNonAnchors && (
                  <div
                    className="px-4 md:px-6 py-3 md:py-4 space-y-2 md:space-y-3 border-t"
                    style={{ borderColor: colors.border }}
                  >
                    {nonAnchorSkills.map((skill) => (
                      <div key={skill.id}>
                        <p
                          className="font-semibold text-sm md:text-base mb-1"
                          style={{ color: colors.text }}
                        >
                          {skill.name}
                        </p>
                        {skill.description && (
                          <p className="text-xs md:text-sm" style={{ color: colors.text2 }}>
                            {skill.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </button>
            )}
          </div>
        )}

        {/* Students Section */}
        <div>
          <h2
            className="text-lg md:text-xl font-serif font-bold mb-3 md:mb-4"
            style={{ color: colors.text }}
          >
            Students in Class
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl animate-pulse"
                  style={{ backgroundColor: colors.border }}
                />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div
              className="p-8 rounded-xl text-center"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                border: `1px solid ${colors.border}`,
              }}
            >
              <p style={{ color: colors.text2 }}>No students in this class.</p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => onSelectStudent(student.id)}
                  className="w-full text-left p-3 md:p-4 rounded-lg border transition-all hover:shadow-md flex items-center gap-3"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  <div
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs md:text-sm font-bold"
                    style={{
                      backgroundColor: colors.amber.bg,
                      borderColor: colors.amber.border,
                      color: colors.amber.text,
                      border: `1px solid ${colors.amber.border}`,
                    }}
                  >
                    {student.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm md:text-base font-semibold truncate"
                      style={{ color: colors.text }}
                    >
                      {student.name}
                    </p>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={colors.text3}
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

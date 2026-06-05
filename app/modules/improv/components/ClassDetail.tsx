/**
 * ClassDetail Component
 * Shows a single class with weeks available for assessment
 */

import React from "react";
import { Class } from "@/lib/types";
import { colors } from "@/app/modules/improv/design/colors";
import { Button } from "@/app/modules/improv/components/ui/Button";

export interface ClassDetailProps {
  cls: Class;
  onBack: () => void;
  onSelectWeek: (weekId: string) => void;
  isLoading?: boolean;
}

export function ClassDetail({
  cls,
  onBack,
  onSelectWeek,
  isLoading = false,
}: ClassDetailProps) {
  const weeks = cls.weeks || [];
  const students = cls.students || [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <div className="p-4 md:p-6">
        {/* Header */}
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
          Back
        </button>

        {/* Class Header */}
        <div
          className="rounded-xl p-4 md:p-6 mb-6 md:mb-8 border"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <h1
            className="text-2xl md:text-3xl font-serif font-bold mb-2"
            style={{ color: colors.text }}
          >
            {cls.name}
          </h1>
          {cls.subtitle && (
            <p className="text-sm md:text-base mb-4" style={{ color: colors.text2 }}>
              {cls.subtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-3 md:gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.text2 }}>
                Duration
              </p>
              <p className="font-semibold" style={{ color: colors.text }}>
                {cls.numWeeks} weeks
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.text2 }}>
                Students
              </p>
              <p className="font-semibold" style={{ color: colors.text }}>
                {students.length}
              </p>
            </div>
          </div>
        </div>

        {/* Weeks Section */}
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
        ) : (
          <>
            <h2
              className="text-lg md:text-xl font-serif font-bold mb-4 md:mb-6"
              style={{ color: colors.text }}
            >
              Weeks
            </h2>

            {weeks.length === 0 ? (
              <div
                className="p-8 rounded-xl text-center"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <p style={{ color: colors.text2 }}>No weeks configured yet.</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {weeks.map((week) => (
                  <button
                    key={week.id}
                    onClick={() => onSelectWeek(week.id)}
                    className="w-full text-left p-4 md:p-5 rounded-xl border transition-all hover:shadow-md active:shadow-lg"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    }}
                  >
                    <div className="flex items-start justify-between mb-2 md:mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 font-bold"
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
                          <h3
                            className="text-base md:text-lg font-serif font-bold"
                            style={{ color: colors.text }}
                          >
                            {week.title || `Week ${week.weekNum}`}
                          </h3>
                        </div>
                      </div>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={colors.text3}
                        strokeWidth="2"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                    {week.focusAreas && (
                      <p
                        className="text-xs md:text-sm ml-0 md:ml-14"
                        style={{ color: colors.text2 }}
                      >
                        {week.focusAreas}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

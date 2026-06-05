/**
 * StudentPicker Component
 * Student view: Pick a class to view their dashboard
 */

import React from "react";
import { Class } from "@/lib/types";
import { colors } from "@/app/modules/improv/design/colors";

export interface StudentPickerProps {
  classes: Class[];
  onSelectClass: (classId: string) => void;
  isLoading?: boolean;
}

export function StudentPicker({
  classes,
  onSelectClass,
  isLoading = false,
}: StudentPickerProps) {
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
        <div className="p-4 md:p-6">
          <div className="animate-pulse space-y-3 md:space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl"
                style={{ backgroundColor: colors.border }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <div className="p-4 md:p-6">
        <div className="mb-6 md:mb-8">
          <h1
            className="text-2xl md:text-3xl font-serif font-bold mb-2"
            style={{ color: colors.text }}
          >
            My Classes
          </h1>
          <p className="text-sm md:text-base" style={{ color: colors.text2 }}>
            Choose a class to view your progress
          </p>
        </div>

        {classes.length === 0 ? (
          <div
            className="text-center py-12 md:py-16 rounded-xl"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <p style={{ color: colors.text2 }}>
              You're not enrolled in any classes yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => onSelectClass(cls.id)}
                className="w-full text-left p-4 md:p-6 rounded-xl border transition-all hover:shadow-md active:shadow-lg"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div>
                    <h3
                      className="text-base md:text-lg font-serif font-bold mb-1"
                      style={{ color: colors.text }}
                    >
                      {cls.name}
                    </h3>
                    {cls.subtitle && (
                      <p className="text-xs md:text-sm" style={{ color: colors.text2 }}>
                        {cls.subtitle}
                      </p>
                    )}
                  </div>
                  <div
                    className="px-2 md:px-3 py-1 rounded-md text-xs md:text-sm font-semibold whitespace-nowrap ml-2 flex-shrink-0"
                    style={{
                      backgroundColor: colors.amber.light,
                      borderColor: colors.amber.border,
                      color: colors.amber.text,
                      border: `1px solid ${colors.amber.border}`,
                    }}
                  >
                    {cls.numWeeks}wk
                  </div>
                </div>

                {cls.pedagogicalContext && (
                  <p className="text-xs" style={{ color: colors.text2 }}>
                    {cls.pedagogicalContext === "improv"
                      ? "Improv Mastery"
                      : "K-12 Assessment"}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

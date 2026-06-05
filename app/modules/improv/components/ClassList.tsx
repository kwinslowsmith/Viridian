/**
 * ClassList Component
 * Teacher view: Lists all classes for an instructor
 */

import React from "react";
import { Class } from "@/lib/types";
import { colors } from "@/app/modules/improv/design/colors";

export interface ClassListProps {
  classes: Class[];
  onSelectClass: (classId: string) => void;
  isLoading?: boolean;
}

export function ClassList({
  classes,
  onSelectClass,
  isLoading = false,
}: ClassListProps) {
  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl"
              style={{ backgroundColor: colors.border }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 md:mb-8">
        <h1
          className="text-2xl md:text-3xl font-serif font-bold mb-2"
          style={{ color: colors.text }}
        >
          Classes
        </h1>
        <p className="text-sm md:text-base" style={{ color: colors.text2 }}>
          {classes.length} class{classes.length !== 1 ? "es" : ""}
        </p>
      </div>

      {classes.length === 0 ? (
        <div
          className="text-center py-12 md:py-16 rounded-xl"
          style={{ backgroundColor: colors.bg }}
        >
          <p style={{ color: colors.text2 }}>No classes available.</p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {classes.map((cls) => (
            <button
              key={cls.id}
              onClick={() => onSelectClass(cls.id)}
              className="w-full text-left p-4 rounded-xl border transition-all hover:shadow-md active:shadow-lg"
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

              <div className="flex items-center gap-2 flex-wrap">
                {cls.students && cls.students.length > 0 ? (
                  <>
                    <div className="flex -space-x-1">
                      {cls.students.slice(0, 4).map((student) => (
                        <div
                          key={student.id}
                          className="w-6 h-6 md:w-7 md:h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor: colors.amber.bg,
                            borderColor: colors.white,
                            color: colors.amber.text,
                          }}
                          title={student.name}
                        >
                          {student.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: colors.text2 }}>
                      {cls.students.length} student
                      {cls.students.length !== 1 ? "s" : ""}
                    </p>
                    {cls.students.length > 4 && (
                      <p className="text-xs" style={{ color: colors.text2 }}>
                        +{cls.students.length - 4} more
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-xs" style={{ color: colors.text3 }}>
                    No students
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

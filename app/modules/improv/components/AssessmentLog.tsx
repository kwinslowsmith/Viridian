/**
 * AssessmentLog Component
 * Shows the assessment method, date, and context for skill assessments
 */

import React from "react";
import { AssessmentLog } from "@/lib/types";
import { colors } from "@/app/modules/improv/design/colors";

export interface AssessmentLogProps {
  logs: AssessmentLog[];
  isLoading?: boolean;
}

export function AssessmentLogComponent({ logs, isLoading = false }: AssessmentLogProps) {
  if (isLoading) {
    return (
      <div
        className="rounded-xl overflow-hidden border"
        style={{ borderColor: colors.border }}
      >
        <div
          className="px-4 md:px-6 py-3 md:py-4 font-semibold text-sm md:text-base"
          style={{
            backgroundColor: colors.surface,
            borderBottom: `1px solid ${colors.border}`,
            color: colors.text,
          }}
        >
          Assessment Log
        </div>
        <div className="animate-pulse space-y-2 p-4 md:p-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-12 rounded"
              style={{ backgroundColor: colors.border }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div
        className="rounded-xl border p-6 md:p-8 text-center"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <p style={{ color: colors.text2 }}>No assessment logs yet.</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{ borderColor: colors.border }}
    >
      <div
        className="px-4 md:px-6 py-3 md:py-4 font-semibold text-sm md:text-base"
        style={{
          backgroundColor: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
          color: colors.text,
        }}
      >
        Assessment Log
      </div>

      <div>
        {logs.map((log, index) => (
          <div
            key={log.id}
            className="px-4 md:px-6 py-4 md:py-5"
            style={{
              backgroundColor: colors.surface,
              borderBottom:
                index < logs.length - 1 ? `1px solid ${colors.border}` : "none",
            }}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2 md:mb-3 gap-2 md:gap-4">
              <div className="flex flex-wrap gap-2">
                {/* Method Badge */}
                <span
                  className="inline-block text-xs font-semibold px-2 md:px-3 py-1 md:py-1.5 rounded"
                  style={{
                    backgroundColor: colors.teal.bg,
                    color: colors.teal.text,
                    border: `1px solid ${colors.teal.border}`,
                  }}
                >
                  {log.method}
                </span>

                {/* Context Badge */}
                {log.context && (
                  <span
                    className="inline-block text-xs font-semibold px-2 md:px-3 py-1 md:py-1.5 rounded"
                    style={{
                      backgroundColor: colors.amber.bg,
                      color: colors.amber.text,
                      border: `1px solid ${colors.amber.border}`,
                    }}
                  >
                    {log.context}
                  </span>
                )}
              </div>

              {/* Date */}
              <p
                className="text-xs md:text-sm whitespace-nowrap"
                style={{ color: colors.text3 }}
              >
                {new Date(log.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Notes */}
            {log.notes && (
              <p
                className="text-sm md:text-base leading-relaxed"
                style={{ color: colors.text }}
              >
                {log.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AssessmentLogComponent;

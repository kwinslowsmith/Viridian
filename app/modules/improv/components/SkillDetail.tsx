/**
 * SkillDetail Component
 * Shows detailed view of a student's rating for a specific skill
 * Including revision history if updated
 */

import React from "react";
import { Skill, StudentRating, TeacherRating, Feedback } from "@/lib/types";
import { colors } from "@/app/modules/improv/design/colors";

export interface SkillDetailProps {
  skill: Skill;
  studentRating?: StudentRating;
  teacherRating?: TeacherRating;
  feedback: Feedback[];
  onBack: () => void;
}

export function SkillDetail({
  skill,
  studentRating,
  teacherRating,
  feedback,
  onBack,
}: SkillDetailProps) {
  const getMasteryColor = (level: string) => {
    switch (level) {
      case "proficient":
        return colors.proficient;
      case "developing":
        return colors.developing;
      case "approaching":
        return colors.approaching;
      default:
        return { bg: colors.bg, border: colors.border, text: colors.text2, accent: "" };
    }
  };

  const studentColor = studentRating ? getMasteryColor(studentRating.level) : null;
  const teacherColor = teacherRating ? getMasteryColor(teacherRating.level) : null;

  const hasDiscrepancy =
    studentRating &&
    teacherRating &&
    studentRating.level !== teacherRating.level;

  const getLevelDefinition = (level: string) => {
    return skill.levelDefinitions[level as keyof typeof skill.levelDefinitions] ||
      "";
  };

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
          Back
        </button>

        {/* Skill Header */}
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
            {skill.name}
          </h1>
          {skill.description && (
            <p className="text-sm md:text-base" style={{ color: colors.text2 }}>
              {skill.description}
            </p>
          )}
          <div className="mt-3 md:mt-4 flex flex-wrap gap-2">
            <span
              className="text-xs font-semibold px-2 py-1 rounded"
              style={{
                backgroundColor: colors.amber.bg,
                color: colors.amber.text,
                border: `1px solid ${colors.amber.border}`,
              }}
            >
              {skill.category}
            </span>
            {skill.isAnchorForUnit && (
              <span
                className="text-xs font-semibold px-2 py-1 rounded flex items-center gap-1"
                style={{
                  backgroundColor: colors.teal.bg,
                  color: colors.teal.text,
                  border: `1px solid ${colors.teal.border}`,
                }}
              >
                <span>◆</span> Anchor Skill
              </span>
            )}
          </div>
        </div>

        {/* Discrepancy Alert */}
        {hasDiscrepancy && (
          <div
            className="rounded-xl p-4 md:p-6 mb-6 md:mb-8 border flex items-start gap-3"
            style={{
              backgroundColor: colors.orange.bg,
              borderColor: colors.orange.border,
            }}
          >
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div>
              <p
                className="font-semibold text-sm md:text-base mb-1"
                style={{ color: colors.orange.text }}
              >
                Rating Difference Detected
              </p>
              <p className="text-xs md:text-sm" style={{ color: colors.orange.text }}>
                Your rating and your instructor's rating differ. Check the feedback
                below for guidance.
              </p>
            </div>
          </div>
        )}

        {/* Ratings Comparison */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Student Rating */}
          {studentRating ? (
            <div
              className="rounded-xl p-4 md:p-6 border"
              style={{
                backgroundColor: colors.surface,
                borderColor: studentColor?.border,
              }}
            >
              <h2
                className="text-base md:text-lg font-semibold mb-3 md:mb-4"
                style={{ color: colors.text }}
              >
                Your Rating
              </h2>

              <div
                className="inline-block px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold text-sm md:text-base mb-3 md:mb-4 border"
                style={{
                  backgroundColor: studentColor?.bg,
                  borderColor: studentColor?.border,
                  color: studentColor?.text,
                }}
              >
                {studentRating.level.charAt(0).toUpperCase() +
                  studentRating.level.slice(1)}
              </div>

              <div
                className="rounded-lg p-3 md:p-4 mb-3 md:mb-4 text-xs md:text-sm"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                {getLevelDefinition(studentRating.level)}
              </div>

              {studentRating.narrative && (
                <div className="mb-3 md:mb-4">
                  <p
                    className="text-xs md:text-sm font-semibold mb-1 md:mb-2"
                    style={{ color: colors.text2 }}
                  >
                    Your Thinking
                  </p>
                  <p
                    className="text-sm md:text-base leading-relaxed"
                    style={{ color: colors.text }}
                  >
                    {studentRating.narrative}
                  </p>
                </div>
              )}

              {studentRating.evidence && (
                <div className="mb-3 md:mb-4">
                  <p
                    className="text-xs md:text-sm font-semibold mb-1 md:mb-2"
                    style={{ color: colors.text2 }}
                  >
                    Evidence
                  </p>
                  <p
                    className="text-sm md:text-base leading-relaxed"
                    style={{ color: colors.text }}
                  >
                    {studentRating.evidence}
                  </p>
                </div>
              )}

              <p
                className="text-xs md:text-sm"
                style={{ color: colors.text3 }}
              >
                {new Date(studentRating.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {studentRating.revisedAt &&
                  ` • Revised ${new Date(studentRating.revisedAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                    }
                  )}`}
              </p>
            </div>
          ) : (
            <div
              className="rounded-xl p-4 md:p-6 border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <p style={{ color: colors.text2 }}>No self-rating yet.</p>
            </div>
          )}

          {/* Teacher Rating */}
          {teacherRating ? (
            <div
              className="rounded-xl p-4 md:p-6 border"
              style={{
                backgroundColor: colors.surface,
                borderColor: teacherColor?.border,
              }}
            >
              <h2
                className="text-base md:text-lg font-semibold mb-3 md:mb-4"
                style={{ color: colors.text }}
              >
                Instructor Rating
              </h2>

              <div
                className="inline-block px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold text-sm md:text-base mb-3 md:mb-4 border"
                style={{
                  backgroundColor: teacherColor?.bg,
                  borderColor: teacherColor?.border,
                  color: teacherColor?.text,
                }}
              >
                {teacherRating.level.charAt(0).toUpperCase() +
                  teacherRating.level.slice(1)}
              </div>

              <div
                className="rounded-lg p-3 md:p-4 text-xs md:text-sm"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                {getLevelDefinition(teacherRating.level)}
              </div>

              <p
                className="text-xs md:text-sm mt-3 md:mt-4"
                style={{ color: colors.text3 }}
              >
                {new Date(teacherRating.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ) : (
            <div
              className="rounded-xl p-4 md:p-6 border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <p style={{ color: colors.text2 }}>No instructor rating yet.</p>
            </div>
          )}
        </div>

        {/* Feedback Section */}
        {feedback.length > 0 && (
          <div>
            <h2
              className="text-lg md:text-xl font-serif font-bold mb-3 md:mb-4"
              style={{ color: colors.text }}
            >
              Instructor Feedback
            </h2>

            <div
              className="rounded-xl overflow-hidden border"
              style={{ borderColor: colors.border }}
            >
              {feedback.map((fb, index) => (
                <div
                  key={fb.id}
                  className="p-4 md:p-6"
                  style={{
                    backgroundColor: colors.surface,
                    borderBottom:
                      index < feedback.length - 1
                        ? `1px solid ${colors.border}`
                        : "none",
                  }}
                >
                  <p
                    className="text-xs md:text-sm mb-2"
                    style={{ color: colors.text2 }}
                  >
                    {new Date(fb.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p
                    className="text-sm md:text-base leading-relaxed"
                    style={{ color: colors.text }}
                  >
                    {fb.instructorNote}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

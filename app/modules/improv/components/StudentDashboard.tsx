/**
 * StudentDashboard Component
 * Student view: Overview of their ratings, progress, and feedback
 */

import React, { useMemo } from "react";
import { Class, Student, Week, Skill, Feedback } from "@/lib/types";
import { colors } from "@/app/modules/improv/design/colors";

export interface StudentDashboardProps {
  cls: Class;
  student: Student;
  onBack: () => void;
  onSelectSkill?: (skillId: string, weekId: string) => void;
}

interface ProgressMetrics {
  proficient: number;
  developing: number;
  approaching: number;
  unrated: number;
  total: number;
  percentage: number;
}

function calculateProgress(student: Student, cls: Class): ProgressMetrics {
  const ratings = student.studentRatings || [];
  const totalSkills = cls.skills?.length || 0;

  if (totalSkills === 0) {
    return {
      proficient: 0,
      developing: 0,
      approaching: 0,
      unrated: 0,
      total: 0,
      percentage: 0,
    };
  }

  const proficient = ratings.filter((r) => r.level === "proficient").length;
  const developing = ratings.filter((r) => r.level === "developing").length;
  const approaching = ratings.filter((r) => r.level === "approaching").length;

  // Weight: proficient = 1, developing = 0.5, approaching = 0
  const weightedScore = proficient + developing * 0.5;
  const percentage = Math.round((weightedScore / totalSkills) * 100);

  return {
    proficient,
    developing,
    approaching,
    unrated: totalSkills - proficient - developing - approaching,
    total: totalSkills,
    percentage,
  };
}

function groupFeedbackByWeek(
  student: Student,
  weeks: Week[]
): Record<string, Feedback[]> {
  const feedback: Record<string, Feedback[]> = {};

  (student.feedback || []).forEach((fb) => {
    if (!feedback[fb.weekId]) {
      feedback[fb.weekId] = [];
    }
    feedback[fb.weekId].push(fb);
  });

  return feedback;
}

export function StudentDashboard({
  cls,
  student,
  onBack,
  onSelectSkill,
}: StudentDashboardProps) {
  const progress = useMemo(
    () => calculateProgress(student, cls),
    [student, cls]
  );

  const feedbackByWeek = useMemo(
    () => groupFeedbackByWeek(student, cls.weeks || []),
    [student, cls]
  );

  const skills = cls.skills || [];
  const weeks = cls.weeks || [];

  // Group skills by category
  const skillsByCategory = useMemo(() => {
    const grouped: Record<string, Skill[]> = {};
    skills.forEach((skill) => {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill);
    });
    return grouped;
  }, [skills]);

  // Calculate progress circle
  const circumference = 2 * Math.PI * 30;
  const strokeDashoffset = circumference - (progress.percentage / 100) * circumference;

  const allFeedback = Object.values(feedbackByWeek).flat();

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

        {/* Hero Card */}
        <div
          className="rounded-xl p-6 md:p-8 mb-6 md:mb-8 text-white"
          style={{ backgroundColor: "#1C1917" }}
        >
          <p className="text-xs md:text-sm opacity-60 mb-2">{cls.name}</p>
          <h1
            className="text-2xl md:text-3xl font-serif font-bold mb-6"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            {student.name}
          </h1>

          <div className="flex items-center gap-6 md:gap-8">
            {/* Progress Circle */}
            <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 68 68"
                style={{ transform: "rotate(-90deg)" }}
              >
                <circle
                  cx="34"
                  cy="34"
                  r="30"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="5"
                />
                <circle
                  cx="34"
                  cy="34"
                  r="30"
                  fill="none"
                  stroke="#FDE68A"
                  strokeWidth="5"
                  strokeDasharray={circumference.toFixed(1)}
                  strokeDashoffset={strokeDashoffset.toFixed(1)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold leading-tight">
                    {progress.percentage}%
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-2 md:gap-3 flex-1">
              {progress.proficient > 0 && (
                <div
                  className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold"
                  style={{
                    backgroundColor: "rgba(34, 197, 94, 0.2)",
                    color: "#86EFAC",
                  }}
                >
                  {progress.proficient} proficient
                </div>
              )}
              {progress.developing > 0 && (
                <div
                  className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold"
                  style={{
                    backgroundColor: "rgba(253, 224, 71, 0.2)",
                    color: "#FDE047",
                  }}
                >
                  {progress.developing} developing
                </div>
              )}
              {progress.approaching > 0 && (
                <div
                  className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold"
                  style={{
                    backgroundColor: "rgba(251, 146, 60, 0.2)",
                    color: "#FB923C",
                  }}
                >
                  {progress.approaching} approaching
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Skills by Category */}
        {Object.keys(skillsByCategory).length > 0 && (
          <div className="mb-6 md:mb-8">
            <h2
              className="text-lg md:text-xl font-serif font-bold mb-3 md:mb-4"
              style={{ color: colors.text }}
            >
              Your Skills
            </h2>

            <div className="space-y-3 md:space-y-4">
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div
                  key={category}
                  className="rounded-xl overflow-hidden border"
                  style={{ borderColor: colors.border }}
                >
                  <div
                    className="px-4 md:px-6 py-3 md:py-4 flex items-center gap-2"
                    style={{
                      backgroundColor: colors.amber.bg,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    <span style={{ color: colors.amber.accent }}>◆</span>
                    <span
                      className="font-semibold text-sm md:text-base"
                      style={{ color: colors.amber.text }}
                    >
                      {category}
                    </span>
                  </div>

                  <div className="px-4 md:px-6 py-3 md:py-4 flex flex-wrap gap-2 md:gap-3">
                    {categorySkills.map((skill) => {
                      const rating = (student.studentRatings || []).find(
                        (r) => r.skillId === skill.id
                      );

                      let badgeBgColor = colors.bg;
                      let badgeBorderColor = colors.border;
                      let badgeTextColor = colors.text2;

                      if (rating) {
                        if (rating.level === "proficient") {
                          badgeBgColor = colors.proficient.bg;
                          badgeBorderColor = colors.proficient.border;
                          badgeTextColor = colors.proficient.text;
                        } else if (rating.level === "developing") {
                          badgeBgColor = colors.developing.bg;
                          badgeBorderColor = colors.developing.border;
                          badgeTextColor = colors.developing.text;
                        } else if (rating.level === "approaching") {
                          badgeBgColor = colors.approaching.bg;
                          badgeBorderColor = colors.approaching.border;
                          badgeTextColor = colors.approaching.text;
                        }
                      }

                      return (
                        <button
                          key={skill.id}
                          onClick={() => {
                            if (onSelectSkill && rating) {
                              onSelectSkill(skill.id, rating.weekId);
                            }
                          }}
                          className="px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold border transition-all hover:shadow-sm"
                          style={{
                            backgroundColor: badgeBgColor,
                            borderColor: badgeBorderColor,
                            color: badgeTextColor,
                            cursor: rating && onSelectSkill ? "pointer" : "default",
                          }}
                        >
                          {skill.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Section */}
        {allFeedback.length > 0 && (
          <div>
            <h2
              className="text-lg md:text-xl font-serif font-bold mb-3 md:mb-4"
              style={{ color: colors.text }}
            >
              Feedback from Instructor
            </h2>

            <div
              className="rounded-xl overflow-hidden border"
              style={{ borderColor: colors.border }}
            >
              <div
                className="px-4 md:px-6 py-3 md:py-4 font-semibold"
                style={{
                  backgroundColor: colors.surface,
                  borderBottom: `1px solid ${colors.border}`,
                  color: colors.text,
                }}
              >
                All Feedback
              </div>

              <div>
                {allFeedback.map((feedback, index) => {
                  const week = weeks.find((w) => w.id === feedback.weekId);
                  const skill = skills.find((s) => s.id === feedback.skillId);

                  return (
                    <div
                      key={feedback.id}
                      className="px-4 md:px-6 py-4 md:py-5"
                      style={{
                        borderBottom:
                          index < allFeedback.length - 1
                            ? `1px solid ${colors.border}`
                            : "none",
                      }}
                    >
                      <div
                        className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 flex-wrap"
                        style={{ color: colors.text2 }}
                      >
                        {week && (
                          <span className="text-xs md:text-sm font-semibold">
                            Week {week.weekNum}
                          </span>
                        )}
                        {skill && (
                          <span
                            className="text-xs font-semibold px-2 py-1 rounded"
                            style={{
                              backgroundColor: colors.amber.bg,
                              color: colors.amber.text,
                              border: `1px solid ${colors.amber.border}`,
                            }}
                          >
                            {skill.name}
                          </span>
                        )}
                        <span
                          className="text-xs md:text-sm ml-auto"
                          style={{ color: colors.text3 }}
                        >
                          {new Date(feedback.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-sm md:text-base leading-relaxed" style={{ color: colors.text }}>
                        {feedback.instructorNote}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {skills.length === 0 && allFeedback.length === 0 && (
          <div
            className="text-center py-12 md:py-16 rounded-xl"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              border: `1px solid ${colors.border}`,
            }}
          >
            <p style={{ color: colors.text2 }}>
              No ratings or feedback yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

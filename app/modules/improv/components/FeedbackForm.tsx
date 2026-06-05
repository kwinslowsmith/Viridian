/**
 * FeedbackForm Component
 * Form for instructors to provide feedback on a student's skill
 */

import React, { useState } from "react";
import { Student, Skill } from "@/lib/types";
import { colors } from "@/app/modules/improv/design/colors";
import { Button } from "@/app/modules/improv/components/ui/Button";

export interface FeedbackFormProps {
  student: Student;
  skill: Skill;
  onSubmit: (feedback: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function FeedbackForm({
  student,
  skill,
  onSubmit,
  onCancel,
  isLoading = false,
}: FeedbackFormProps) {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = feedback.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit(feedback);
      setFeedback("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div
          className="rounded-xl p-6 md:p-8 mb-6 md:mb-8 text-white"
          style={{ backgroundColor: "#1C1917" }}
        >
          <h1
            className="text-2xl md:text-3xl font-serif font-bold mb-2"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Feedback for {student.name}
          </h1>
          <p className="text-sm md:text-base opacity-80">
            Provide constructive feedback on {skill.name}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl overflow-hidden border mb-6 md:mb-8"
          style={{ borderColor: colors.border }}
        >
          <div
            className="px-4 md:px-6 py-4 md:py-6"
            style={{
              backgroundColor: colors.surface,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <p
              className="text-xs md:text-sm uppercase tracking-wider font-semibold"
              style={{ color: colors.text2 }}
            >
              Skill
            </p>
            <p
              className="text-base md:text-lg font-semibold mt-1 md:mt-2"
              style={{ color: colors.text }}
            >
              {skill.name}
            </p>
            {skill.description && (
              <p className="text-xs md:text-sm mt-2" style={{ color: colors.text2 }}>
                {skill.description}
              </p>
            )}
          </div>

          <div className="p-4 md:p-6">
            <label
              className="block text-xs md:text-sm uppercase tracking-wider font-semibold mb-3 md:mb-4"
              style={{ color: colors.text2 }}
            >
              Your Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Be specific and constructive. Focus on what they did well and where they can improve..."
              className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border text-sm md:text-base focus:outline-none focus:ring-2 resize-none"
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
                color: colors.text,
              }}
              rows={8}
            />

            <div className="mt-4 md:mt-6 flex gap-3">
              <Button
                onClick={onCancel}
                variant="secondary"
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                isLoading={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * StudentSelfRatingForm Component
 * Form for students to self-rate their skills
 */

import React, { useState } from "react";
import { Skill, MasteryLevel } from "@/lib/types";
import { colors } from "@/app/modules/improv/design/colors";
import { Button } from "@/app/modules/improv/components/ui/Button";

export interface StudentSelfRatingFormProps {
  skills: Skill[];
  onSubmit: (skillId: string, level: MasteryLevel, narrative?: string, evidence?: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  requireNarrative?: boolean;
  requireEvidence?: boolean;
}

const LEVELS: MasteryLevel[] = ["approaching", "developing", "proficient"];

export function StudentSelfRatingForm({
  skills,
  onSubmit,
  onCancel,
  isLoading = false,
  requireNarrative = false,
  requireEvidence = false,
}: StudentSelfRatingFormProps) {
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [level, setLevel] = useState<MasteryLevel | null>(null);
  const [narrative, setNarrative] = useState("");
  const [evidence, setEvidence] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSkill = selectedSkillId
    ? skills.find((s) => s.id === selectedSkillId)
    : null;

  const canSubmit =
    selectedSkillId &&
    level &&
    (!requireNarrative || narrative.trim()) &&
    (!requireEvidence || evidence.trim());

  const handleSubmit = async () => {
    if (!selectedSkillId || !level) return;

    setIsSubmitting(true);
    try {
      await onSubmit(
        selectedSkillId,
        level,
        narrative || undefined,
        evidence || undefined
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMasteryColor = (lvl: MasteryLevel) => {
    switch (lvl) {
      case "proficient":
        return colors.proficient;
      case "developing":
        return colors.developing;
      case "approaching":
        return colors.approaching;
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
            className="text-2xl md:text-3xl font-serif font-bold mb-3"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Self-Assessment
          </h1>
          <p className="text-sm md:text-base opacity-80">
            Rate yourself on a skill from this week. Be honest about where you
            are—there's no judgment.
          </p>
        </div>

        {/* Skill Selector */}
        <div
          className="rounded-xl overflow-hidden border mb-6 md:mb-8"
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
            Select a Skill
          </div>

          <div>
            {skills.length === 0 ? (
              <div
                className="p-8 text-center"
                style={{ color: colors.text3 }}
              >
                No skills available.
              </div>
            ) : (
              skills.map((skill, index) => (
                <button
                  key={skill.id}
                  onClick={() => {
                    setSelectedSkillId(skill.id);
                    setLevel(null);
                  }}
                  className="w-full text-left px-4 md:px-6 py-3 md:py-4 transition-colors"
                  style={{
                    backgroundColor:
                      selectedSkillId === skill.id
                        ? colors.amber.bg
                        : colors.surface,
                    borderBottom:
                      index < skills.length - 1
                        ? `1px solid ${colors.border}`
                        : "none",
                  }}
                >
                  <p
                    className="font-semibold text-sm md:text-base"
                    style={{
                      color:
                        selectedSkillId === skill.id
                          ? colors.amber.accent
                          : colors.text,
                    }}
                  >
                    {skill.name}
                  </p>
                  {selectedSkillId === skill.id && skill.description && (
                    <p
                      className="text-xs md:text-sm mt-1 md:mt-2"
                      style={{ color: colors.text2 }}
                    >
                      {skill.description}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Level Selector */}
        {selectedSkill && (
          <div
            className="rounded-xl overflow-hidden border mb-6 md:mb-8"
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
              Rate Yourself
            </div>

            <div className="p-4 md:p-6">
              <p
                className="text-xs md:text-sm uppercase tracking-wider font-semibold mb-3 md:mb-4"
                style={{ color: colors.text2 }}
              >
                Mastery Level
              </p>

              <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                {LEVELS.map((lvl) => {
                  const color = getMasteryColor(lvl);
                  return (
                    <button
                      key={lvl}
                      onClick={() => setLevel(lvl)}
                      className="w-full text-left p-3 md:p-4 rounded-lg border-2 transition-all"
                      style={{
                        backgroundColor:
                          level === lvl ? color.bg : colors.surface,
                        borderColor: level === lvl ? color.border : colors.border,
                      }}
                    >
                      <p
                        className="font-semibold text-sm md:text-base capitalize"
                        style={{
                          color: level === lvl ? color.text : colors.text,
                        }}
                      >
                        {lvl}
                      </p>
                      {level === lvl && (
                        <p
                          className="text-xs md:text-sm leading-relaxed mt-1 md:mt-2"
                          style={{ color: colors.text2 }}
                        >
                          {
                            selectedSkill.levelDefinitions[
                              lvl as keyof typeof selectedSkill.levelDefinitions
                            ]
                          }
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Narrative */}
              <div className="mb-4 md:mb-6">
                <label
                  className="block text-xs md:text-sm uppercase tracking-wider font-semibold mb-2 md:mb-3"
                  style={{ color: colors.text2 }}
                >
                  What made you choose this level?{" "}
                  {!requireNarrative && (
                    <span style={{ color: colors.text3 }}>(optional)</span>
                  )}
                </label>
                <textarea
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  placeholder="Your thoughts..."
                  className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border text-sm md:text-base focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                  rows={4}
                />
              </div>

              {/* Evidence */}
              <div className="mb-6 md:mb-8">
                <label
                  className="block text-xs md:text-sm uppercase tracking-wider font-semibold mb-2 md:mb-3"
                  style={{ color: colors.text2 }}
                >
                  Evidence from this week{" "}
                  {!requireEvidence && (
                    <span style={{ color: colors.text3 }}>(optional)</span>
                  )}
                </label>
                <textarea
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  placeholder="A specific example or moment..."
                  className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border text-sm md:text-base focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                  rows={4}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
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
                  {isSubmitting ? "Submitting..." : "Submit Self-Assessment"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

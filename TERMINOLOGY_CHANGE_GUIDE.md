# Terminology & Copy Change Guide

**Purpose:** Ensure consistent, encouraging language across all user-facing text  
**Target Users:** Students, Teachers, Admins  
**Rationale:** Current language is too formal and often discouraging (especially red "Mandatory" badge)  
**Implementation:** Update display layer only (data model unchanged)

---

## 1. STUDENT-FACING TERMINOLOGY

### Learning Goals & Standards

| Current | New | Context | Example |
|---------|-----|---------|---------|
| "Learning Objectives" | "What You'll Learn" | Page/section header | "What You'll Learn in Public Speaking" |
| "Objective" (singular) | "Learning Goal" | When referring to one item | "Your next learning goal is..." |
| "Standard" | "Skill" | When used with students | "You're mastering the Listening skill" |

### Mandatory vs Optional

| Current | New | Badge Color | Context | Example |
|---------|-----|-------------|---------|---------|
| "Mandatory" | "Core Skill" | Blue ●● | Objective is required for mastery | "This is a core skill" |
| "Required Objectives" | "Core Skills to Master" | N/A | Section header for required objectives | "Core Skills to Master (5)" |
| "Optional Objectives" | "Challenge Objectives" | Purple ●● | Section header for optional objectives | "Challenge Objectives (3)" |
| N/A | "Need this one" | N/A | Tooltip or help text | "You need this one for mastery" |

### Progress & Status

| Current | New | Context | Example |
|---------|-----|---------|---------|
| "Not Started" | "Not Yet Started" | Status badge (grey) | Objective not attempted |
| "Submitted" | "Submitted" | Status badge (orange) | Work waiting for feedback |
| "Graded" | "Graded" | Status badge (green) | Feedback received |
| "Passed" | "Mastered" | Result of grading | "Congratulations, you've mastered this!" |
| "Failed" | "Needs Improvement" | Result of grading | "You've got this! Here's what to work on..." |

### Submission & Work

| Current | New | Context |
|---------|-----|---------|
| "Student Submission" | "Your Work" | Label in submission form |
| "Self-Assessment" | "Your Reflection" | Label for student feedback |
| "How well do you think you did?" | "How are you feeling about your work?" | Prompt text (more casual, supportive) |

### Progress Indicators

| Current | New | Context | Example |
|---------|-----|---------|---------|
| N/A | "You've learned" | Success messaging | "You've learned 4 of 5 core skills" |
| N/A | "You're close!" | Encouragement at 75%+ | "You're close! One more skill to master." |
| N/A | "Well done!" | Celebration at mastery | "🎉 Well done! You've mastered [Skill]" |

---

## 2. TEACHER-FACING TERMINOLOGY

### Assessment & Grading

| Current | New | Context |
|---------|-----|---------|
| "Grading Dashboard" | "Grading Inbox" | Main teacher interface |
| "Student passed this objective" | "Student mastered this objective" | Grading modal checkbox |
| "Your Feedback" | "Your Feedback & Guidance" | Textarea label in grading modal |
| "Provide constructive feedback" | "Help them improve: What went well? What's next?" | Textarea placeholder |

### Status & Progress

| Current | New | Context |
|---------|-----|---------|
| "Pending feedback" | "Waiting for grade" | Submission status |
| "Mastery Rate" | "% Mastered" | Metric label |
| "Pass Percentage" | "Mastery Threshold" | Setting name |
| "2 mandatory, 8 to pass" | "Complete 2 core + 6 of 8 challenge objectives" | Class overview text |

### Actions & Settings

| Current | New | Context |
|---------|-----|---------|
| "Mark as mandatory objective" | "Mark as required for mastery" | Checkbox in objective setup |
| N/A | "Requires reteaching" | New action flag for low-pass objectives |
| N/A | "Send reminder" | Action for non-submitting students |

---

## 3. ADMIN-FACING TERMINOLOGY

### Mastery & Performance

| Current | New | Context |
|---------|-----|---------|
| "Mastery Level" | "Mastery %" | Dashboard metric |
| "Pass Rate" | "Mastery Rate" | Objective performance metric |
| "Low performance" | "Below target" | Alert threshold |
| "Flagged" | "Needs attention" | Alert status |

### Health & Implementation

| Current | New | Context |
|---------|-----|---------|
| N/A | "Implementation health" | Teacher/class status metric |
| N/A | "Teacher health score" | Composite metric of adoption/effectiveness |
| "Active submissions" | "Pending submissions" | Backlog indicator |
| "Not graded" | "Awaiting feedback" | Submission status for admin view |

### Trends & Insights

| Current | New | Context |
|---------|-----|---------|
| "Mastery trend" | "Progress trend" | Time-series visualization label |
| N/A | "Students on track" | Group label for 50-79% mastery |
| N/A | "Rapid progress" | Positive alert (e.g., +8% week-over-week) |
| N/A | "At risk" | Alert label for <50% mastery students |

---

## 4. SENTIMENT & TONE CHANGES

### Red (Threatening/Negative) → Blue (Supportive)

Current approach uses red for "Mandatory" badge, creating anxiety.

**Change:**
- "Mandatory" badge: RED → BLUE with label "Core Skill"
- Tone: "You must do this" → "This is important for your success"
- Messaging: Threat → Support

### Technical Language → Accessible Language

| Current (Technical) | New (Accessible) |
|------------|------------------|
| "Objective Assessment" | "Your Work & Feedback" |
| "Student Proficiency Level" | "Mastery Progress" |
| "Learning Target" | "What You're Working Toward" |
| "Evidence Criteria" | "What Success Looks Like" |

### Passive → Active/Encouraging

| Current | New |
|---------|-----|
| "Work submitted" | "Great! Your work is submitted" |
| "Objective graded" | "Your work has been reviewed!" |
| "Assessment completed" | "You've shown mastery!" |
| "No submissions" | "Ready to begin? Click here to start" |

---

## 5. IMPLEMENTATION CHECKLIST

### Components to Update

#### Student Components
- [ ] `StudentObjectiveList.tsx` - Change "Learning Objectives" → "What You'll Learn"
- [ ] `StudentObjectiveList.tsx` - Change "Mandatory" badge → "Core Skill"
- [ ] `StudentObjectiveList.tsx` - Change section headers (required/optional)
- [ ] `StudentObjectiveSubmission.tsx` - Update submission labels
- [ ] `StudentObjectiveSubmission.tsx` - Update success/graded messaging
- [ ] `ObjectivesPanel.tsx` - Update all terminology
- [ ] `SkillMasteryCard.tsx` (new) - Use "Core Skills to Master" language

#### Teacher Components
- [ ] `TeacherGradingDashboard.tsx` → `TeacherGradingInbox.tsx` - Rename + update labels
- [ ] `SubmissionGradingModal.tsx` - Update feedback prompts
- [ ] `SkillObjectiveManager.tsx` - Update objective setup language
- [ ] `ClassProgressDashboard.tsx` (new) - Use mastery terminology

#### Admin Components
- [ ] `K12StandardsInterface.tsx` → `AdminDashboard.tsx` - Rename + update terminology
- [ ] `AdminDashboard.tsx` (new) - Use mastery rate, implementation health

### Configuration File
- [ ] Create `app/config/terminology.ts` with all constants
- [ ] Import and use in all components
- [ ] Add JSDoc comments explaining each term

### API Response Adjustments (Display Layer Only)
- [ ] Data model `isMandatory` stays unchanged
- [ ] Only display layer changes:
  - If `isMandatory === true` → show "Core Skill"
  - If `isMandatory === false` → show "Challenge Skill"

---

## 6. COPY EXAMPLES BY USER ROLE

### Student Welcome

**Before:**
"Complete all mandatory objectives and pass 80% overall to demonstrate this standard."

**After:**
"Master the core skills below and you'll demonstrate mastery of this standard. Challenge yourself with the optional objectives to deepen your learning."

### Student Encouragement

**Before:**
(No encouragement shown)

**After:**
- At 50% mastery: "You're halfway there! Keep going—you've got this!"
- At 75% mastery: "You're so close! One more core skill to master."
- At 100% mastery: "🎉 You've mastered this skill! Ready for a challenge? Try the challenge objectives."

### Teacher Status Report

**Before:**
"5 mandatory, 8 to pass, 2 not started"

**After:**
"Students need to master 5 core skills. After that, 8 challenge objectives are available. 2 core skills not yet attempted."

### Admin Alert

**Before:**
"Math.1 has low pass rate (45%)"

**After:**
"Math.1 is below target mastery (45%). [View classes] [Schedule intervention]"

---

## 7. COLORS & VISUAL INDICATORS

### Badge Colors

| Concept | Current | New | Hex |
|---------|---------|-----|-----|
| Core Skill | Red (threatening) | Blue (supportive) | #0891b2 |
| Challenge Skill | N/A | Purple (optional) | #a855f7 |
| Mastered | Green | Green | #10b981 |
| In Progress | Yellow | Yellow | #f59e0b |
| Not Started | Gray | Gray | #9ca3af |

### Icon/Symbol Changes

| Concept | Current | New | Usage |
|---------|---------|-----|-------|
| Core Skill Required | (none) | ⭐ or ●● | Objective marking |
| Mastered | ✓ | ✅ or 🎉 | Success indicator |
| Action Needed | ! | ⚠️ | Alert indicator |

---

## 8. GRAMMAR & STYLE RULES

### Capitalization
- "Core Skill" (title case when used as label)
- "core skill" (lowercase in sentences)
- Example: "This is a Core Skill" vs "This core skill is required"

### Punctuation
- Use contractions: "You're close!" not "You are close!"
- Use exclamation marks for encouragement (not every sentence)
- Use bullet points for clarity (not paragraphs)

### Verb Tense
- Present: "You're learning..."
- Past: "You've mastered..."
- Future: "You'll demonstrate mastery when..."

### Active Voice (Preferred)
- "You've mastered this" ✓
- "This has been mastered" ✗

---

## 9. TESTING CHECKLIST

### Visual Testing
- [ ] All badges correct color
- [ ] All labels updated
- [ ] No hardcoded old terminology visible
- [ ] Consistent spacing/alignment

### Functional Testing
- [ ] Data model unchanged (isMandatory still works in backend)
- [ ] Filtering by core/challenge skills works
- [ ] Progress calculations unchanged
- [ ] Sorting/searching works

### User Testing
- [ ] Students find language encouraging
- [ ] Teachers understand requirements clearly
- [ ] Admins see clear performance indicators
- [ ] No confusion about terminology

---

## 10. ROLLBACK PLAN

If terminology changes cause issues:
1. Revert `app/config/terminology.ts` imports
2. Revert component display changes (if done as separate PRs)
3. Data model remains unchanged, so no data loss
4. Can be reverted in <30 minutes

---

## 11. GLOSSARY (For Reference)

### Key Terms Defined

**Core Skill:**
A learning goal that is essential for students to demonstrate mastery of the standard. Students must complete all core skills.

**Challenge Skill:**
A learning goal that helps students deepen their understanding beyond the core requirements. Completing challenge skills is optional.

**Mastery:**
Students have demonstrated they understand the concept and can apply it. Shown through completed work that meets the criteria.

**Mastery Rate / Mastery %:**
The percentage of students who have mastered a skill or objective. (e.g., "75% of students have mastered this skill")

**Mastery Threshold:**
The percentage of objectives a student must pass to demonstrate mastery of a standard. (e.g., "Pass 80% of objectives to demonstrate mastery")

**Implementation Health:**
A score (1-5 or % based) indicating how well a teacher is implementing the mastery-based system. Based on: adoption rate, grading speed, student engagement.

---

## Deployment Notes

1. **Deploy as single PR** covering all terminology changes
2. **Update before launch** to ensure consistent student experience
3. **Notify teachers** of new terminology in launch email
4. **Add to help center** with examples of each term
5. **Monitor** feedback in first week for confusion

---

## Questions for Stakeholders

1. Do you agree that "Core Skill" is better than "Mandatory"?
2. Should we use emoji (🎉, ⭐) or just text badges?
3. Any other terminology concerns?
4. Should we adjust tone/formality anywhere?

---

**Document Version:** 1.0  
**Last Updated:** August 6, 2026  
**Status:** Ready for implementation

# T3: Parent Dashboard MVP — Updated Brief

**Orchestrator**: Kyle (T1)  
**Window**: T3 (Parent Experience)  
**Status**: 📋 READY TO START  
**Timeline**: 10-12 hours (parallel with T1 backend build)  

---

## What You're Building

A parent-friendly progress dashboard that shows:
- **Child's mastery progress** on each standard (no jargon)
- **"What does this mean?"** plain-language explanations
- **"How can I help?"** actionable tips for home support
- **Master calendar** showing school-wide assessments
- **Status indicators** (on track / needs support / not started)
- **Recommended resources** for each standard

**KEY PRINCIPLE**: No technical jargon. Parents grew up with A/B/C grades. Explain everything.

---

## Contract-First Development

### API You'll Consume

```
GET /api/k12/parents/children/[childId]/progress
```

**Response Shape** (see `/mocks/k12-api-responses.ts::mockParentProgress`):

```typescript
{
  childId: string;
  childName: string;
  gradeLevel: number;
  classId: string;
  className: string;
  teacher: {
    name: string;
    email: string;
  };
  standards: [
    {
      id: string;
      name: string;
      code: string; // CCSS.SCIENCE.HS.LS1.A
      masteryPercent: number; // 0-100
      status: "on-track" | "needs-support" | "not-started";
      description: string; // What is this standard about?
      whatItMeans: string; // Plain English: "Mastery means Alex can..."
      howToHelp: string[]; // 3-5 actionable tips
      objectives: [
        {
          text: string;
          status: "mastered" | "in-progress" | "not-started";
          isMandatory: boolean;
        }
      ];
      recommendedResources: [
        {
          title: string;
          type: "video" | "article" | "interactive" | "practice";
          url: string;
        }
      ];
    }
  ];
  masterCalendarEvents: [
    {
      id: string;
      name: string;
      date: string; // ISO 8601
      type: "major-assessment" | "high-stakes" | "quiz" | "project";
      standardsAssessed: string[]; // standard IDs
    }
  ];
  lastUpdate: string; // ISO 8601
}
```

---

## How to Build Using Mocks

### Step 1: Import Mock Data
```typescript
import { mockParentProgress, useParentProgress } from '@/mocks/k12-api-responses';

const { data, loading } = useParentProgress(childId);
```

### Step 2: Build the Component
**File**: `/app/components/ParentDashboard.tsx`

**Required sections**:

1. **Header**
   - Child name + grade level
   - Class name + teacher name + email link
   - "Last updated: [time]"
   - Warm, encouraging tone

2. **Standards Overview**
   - For each standard: status pill (green "On Track", orange "Needs Support", gray "Not Started")
   - Name + brief description
   - Mastery % in large text
   - Mini progress bar

3. **Expandable Standard Details** (on click)
   - **"What is this?"** section
     - Plain description of the standard
   - **"What does mastery mean?"** section
     - Copy directly from `whatItMeans` field
     - Use simple language: "This means Alex can..."
   - **"How can I help?"** section
     - Bulleted list from `howToHelp` array
     - Examples: "Ask Alex to explain...", "Watch a video together...", "Quiz on vocabulary..."
   - **Objectives** sub-list
     - Show each objective with status dot
     - Highlight mandatory (core skill) with badge
   - **Recommended resources** (if available)
     - Links to Khan Academy, articles, practice problems
     - Type icon: 📹 (video), 📄 (article), 🎮 (interactive)

4. **Master Calendar** (separate section or tab)
   - Upcoming school-wide assessments
   - Date, type (major assessment / high stakes / quiz)
   - Which standards it covers
   - Simple table or calendar view

5. **Call-to-Action**
   - "Questions? Email [teacher email]"
   - Link to school support resources
   - Glossary link (Phase 2)

---

## Plain Language Guidelines

**DO:**
- "Mastery means Alex can understand and apply..."
- "This is a foundational skill that..."
- "Think of this like..." (real-world analogy)

**DON'T:**
- "Learning objectives"
- "Standards-based learning" (explain instead)
- "Competency" or "core competency"
- Technical jargon (rubric, scaffold, formative assessment)

**Example transformations:**
- ❌ "Alex has achieved level 3 mastery on the communication core competency"
- ✅ "Alex can clearly explain ideas and listen well. They're almost at mastery."

---

## Styling

- **Color scheme**: Warm, inviting (avoid clinical look)
  - Status: Green `#10b981` (on track), Orange `#f59e0b` (needs support), Gray `#9ca3af` (not started)
  - Core Skill badge: Blue `#3b82f6`
  - Challenge badge: Purple `#8b5cf6`
- **Typography**: Large, readable (parents may have reading difficulties)
  - Body text: 16px minimum
  - Headers: Clear hierarchy
- **Mobile-first**: Test on 375px width (parent often uses phone)
- **Light theme**: Easy on eyes (evening reading)
- **No animations**: Keep focus on information

---

## Success Criteria

✅ Displays child name, class, teacher info  
✅ All standards visible with status pills (on track / needs support / not started)  
✅ Expandable sections show "What does this mean?" + "How can I help?"  
✅ No jargon (plain language throughout)  
✅ Master Calendar events displayed  
✅ Mobile responsive (readable on phone)  
✅ No console errors  
✅ All text is parent-friendly (test with non-educator)  

---

## When T1 Finishes Backend (Integration: ~1 hr)

1. Replace mock import with real API call
2. Test with real data
3. Report any differences to T1

---

## Important Notes

- **This is NOT the same as student dashboard**: Parents see explanations + tips, not grades/submissions
- **Visibility is critical**: Parents should only see their child's data (T1 handles authorization)
- **Phone experience is primary**: Many parents check on their phones during day

---

## Blockers / Dependencies

None! Start immediately with mock data.  
T1 will notify you when real API ready (~24 hrs).

---

## Your Deliverable

When complete:
1. Commit with new component + route
2. Screenshots (desktop + mobile) showing:
   - Header + standard overview
   - Expanded standard with "What does this mean?" + "How can I help?"
   - Master Calendar
3. Any questions about plain-language explanations
4. Time spent

We'll integrate with real API and ship to production.

# Viridian — Mastery Tracker for Improv & K-12

A pedagogically-sound mastery tracker built on Next.js, React, and TypeScript. Designed for teachers and students to track skill development, self-evaluation, and growth.

## Project Structure

```
app/
  modules/
    improv/          # Improv mastery tracker (P1)
      components/    # React components
      hooks/         # Custom hooks (useClass, useWeek, etc.)
    k12/             # K-12 humanities mastery tracker (P2)
      components/
      hooks/

lib/
  types/             # TypeScript types (Skills, Ratings, Feedback, etc.)
  api/               # API client utilities
  utils/             # Helper functions

docs/
  schema/            # Database schema design (Archon)
  design/            # Wireframes and design system (Iris)
  frontend/          # Component documentation (Sage)
```

## Team Roles

- **Archon** (Systems Architect): Schema design, API architecture, data integrity
- **Iris** (Designer): Wireframes, design system, interaction flows
- **Sage** (Frontend Engineer): React components, state management, API integration

## Key Features (P1)

- Student self-evaluation (before teacher rates)
- Teacher proficiency ratings (3-level: Approaching / Developing / Proficient)
- Anchor standards (focused assessment per unit)
- Feedback system (tied to skills, visible to students)
- Assessment log (track how/when students were assessed)
- Discrepancy detection (flag mismatches between student/teacher ratings)
- Student revision tracking (with timestamps)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Documentation

- **Schema Design** → `docs/schema/`
- **Design System & Wireframes** → `docs/design/`
- **Component Architecture** → `docs/frontend/`

## Timeline

- **P1 (Improv):** June 2–16, 2026
  - Working model due Friday June 5
  - Polish & testing June 8–12
  - Live pilot with MF Improv ~June 16

- **P2 (K-12 + Full Vision):** TBD (based on P1 feedback)

---

Built with ❤️ by Kyle, Archon, Iris, and Sage.

# Demo Environment Setup Guide

**Purpose**: Launch test/demo version with mock data before security implementation  
**Target Launch**: Week 3 of August 2026  
**Real Data Launch**: November 2026 (after security compliance)

---

## Overview

This document covers all setup needed to deploy a demo version with test data only. The demo version:

- ✅ Shows all Viridian features working
- ✅ Uses realistic fake data
- ✅ Has clear disclaimers that it's a test environment
- ✅ Allows stakeholders to provide feedback
- ❌ Does NOT contain real student data
- ❌ Does NOT require full security implementation yet

---

## Phase 1: Seed Demo Data (Week 1-2)

### Run Demo Seed Script

```bash
cd ~/Desktop/Viridian

# Run the demo seed script
npx ts-node prisma/seed-demo.ts
```

**What this creates**:
- Test organization: "Demo Charter High School"
- Test users:
  - 1 Admin: `admin@demo.test` / `demo-password-123`
  - 1 Teacher: `teacher@demo.test` / `demo-password-123`
  - 5 Students: `student1-5@demo.test` / `demo-password-123`
  - 5 Parents: `parent1-5@demo.test` / `demo-password-123`
- Test classes:
  - 1 K12 Class: "Demo Literature - Period 3" (11th grade)
  - 1 Improv Class: "Improv Basics - Demo"
- Test standards:
  - 2 content standards with 5 objectives
  - Realistic performance data (3 students at different stages)
- Test Polymath content:
  - Sample articles, tools

**Script location**: `prisma/seed-demo.ts`

### Verify Seed Worked

```bash
# Login as admin to verify data
npm run dev

# Visit http://localhost:3000/auth/login
# Use: admin@demo.test / demo-password-123
# Should see organization dashboard with test data
```

---

## Phase 2: Add Demo Disclaimers (Week 2)

### Create Demo Banner Component

```typescript
// app/components/DemoBanner.tsx

export function DemoBanner() {
  return (
    <div className="bg-yellow-50 border-b-2 border-yellow-400 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <span className="text-2xl">🔐</span>
        <div>
          <p className="font-semibold text-yellow-900">
            TEST ENVIRONMENT - MOCK DATA ONLY
          </p>
          <p className="text-sm text-yellow-800">
            This is a demonstration with fake student data. Real student data 
            will be available after security audit completion (November 2026).
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Add Banner to Root Layout

```typescript
// app/layout.tsx

import { DemoBanner } from "@/app/components/DemoBanner";

export default function RootLayout({ children }) {
  const isDemoEnvironment = process.env.NEXT_PUBLIC_ENVIRONMENT === "demo";
  
  return (
    <html>
      <body>
        {isDemoEnvironment && <DemoBanner />}
        {children}
      </body>
    </html>
  );
}
```

### Add Demo Notice to Login Page

```typescript
// app/auth/login/page.tsx

export default function LoginPage() {
  return (
    <div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="font-semibold text-blue-900">Demo Credentials</p>
        <p className="text-sm text-blue-800 mt-2">
          Email: <code className="bg-white px-2 py-1">demo@viridian.test</code>
        </p>
        <p className="text-sm text-blue-800">
          Password: <code className="bg-white px-2 py-1">demo-password-123</code>
        </p>
        <p className="text-xs text-blue-600 mt-3 italic">
          This is a test environment with mock data only.
        </p>
      </div>
      
      {/* Login form */}
    </div>
  );
}
```

### Update Privacy Policy Placeholder

```typescript
// app/privacy/page.tsx

export default function PrivacyPage() {
  return (
    <div className="prose prose-lg max-w-3xl mx-auto py-12">
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8">
        <p className="font-semibold text-amber-900">⚠️ DEMO VERSION</p>
        <p className="text-sm text-amber-800">
          This is a test environment with mock data only. Final Privacy Policy 
          will be available November 2026 when production launch is ready.
        </p>
      </div>

      <h1>Privacy Policy - Demo Environment</h1>
      
      <h2>Overview</h2>
      <p>This is a temporary privacy policy for the demo environment...</p>
      
      <h2>Real Privacy Policy</h2>
      <p>
        A comprehensive Privacy Policy will be finalized and published November 2026
        before real student data is imported. The final policy will include:
      </p>
      <ul>
        <li>Detailed data collection practices</li>
        <li>Student/parent rights under FERPA</li>
        <li>Data retention schedule (7 years)</li>
        <li>Data breach notification procedures</li>
        <li>Massachusetts compliance details</li>
      </ul>
    </div>
  );
}
```

---

## Phase 3: Environment Configuration (Week 2-3)

### Set Demo Environment Variable

```bash
# .env.local

# ... existing variables ...

NEXT_PUBLIC_ENVIRONMENT="demo"
NEXT_PUBLIC_DEMO_MODE="true"
```

### Vercel Deployment Configuration

Create `vercel.json` (if needed):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_ENVIRONMENT": "demo"
  }
}
```

### Database Connection for Demo

Use **separate database** for demo (do NOT use production):

```bash
# .env.local

DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database-name-demo]"
```

✅ **Recommended**: Use separate Supabase project for demo
- Project 1: `viridian-demo` (demo.vercel.app)
- Project 2: `viridian-prod` (production later)

---

## Phase 4: Final Pre-Launch (Week 3)

### Testing Checklist

- [ ] Login works with demo credentials (admin, teacher, student, parent)
- [ ] K12 Standards page loads with test data
- [ ] Student can see own grades/progress
- [ ] Teacher can see enrolled students' data
- [ ] Parent can see child's data (if student authorized)
- [ ] Improv Mastery Tracker shows test data
- [ ] Polymath Magazine displays test articles
- [ ] Messaging Center works (test message between teacher/student)
- [ ] Demo banners visible on all pages
- [ ] Privacy page shows "Demo" notice
- [ ] No real student data visible

### Local Testing

```bash
# 1. Run locally first
npm run dev

# 2. Test as each user type:
# - Admin (admin@demo.test)
# - Teacher (teacher@demo.test)
# - Student (student1@demo.test)
# - Parent (parent1@demo.test)

# 3. Verify key features:
# ✓ Dashboard loads
# ✓ Can access own data
# ✓ Cannot access others' data
# ✓ Messaging works
# ✓ Standards interface displays

# 4. Check for console errors:
# Open DevTools (F12)
# Should see no critical errors
# Demo warnings are OK
```

### Build Test

```bash
# Test production build locally
npm run build
npm start

# Visit http://localhost:3000
# Run same testing checklist
```

---

## Phase 5: Deployment (Week 3)

### Step 1: Push to GitHub

```bash
cd ~/Desktop/Viridian

# Verify all changes
git status

# Add seed script and documentation
git add prisma/seed-demo.ts
git add app/components/DemoBanner.tsx
git add docs/DEMO_ENVIRONMENT_SETUP.md
git add docs/AUDIT_LOGGING_DESIGN.md

# Commit
git commit -m "feat(demo): Add demo data seed and test environment setup

Demo environment with mock data:
- Seed script creates realistic test users and data
- Demo banners on all pages: 'Test Environment - Mock Data Only'
- Demo credentials provided on login page
- Privacy policy placeholder noting real policy coming Nov 2026
- Separate demo database configuration
- Ready for stakeholder feedback

Demo users:
- Admin: admin@demo.test / demo-password-123
- Teacher: teacher@demo.test / demo-password-123
- Students: student1-5@demo.test / demo-password-123
- Parents: parent1-5@demo.test / demo-password-123

Test data includes:
- 1 K12 class with 5 students
- 2 standards with 5 objectives
- Realistic student progress (3 students at different stages)
- 1 Improv class
- Polymath sample content

NOT included (added in September):
- Audit logging
- Encryption at rest
- Privacy policy
- DPA with Supabase
- Incident response plan

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# Push to GitHub
git push origin main
```

### Step 2: Deploy to Vercel

**Using CLI**:
```bash
vercel --prod
```

**Using Dashboard**:
1. Go to vercel.com
2. Select Viridian project
3. Should auto-deploy from git push

### Step 3: Configure Vercel Environment

In Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_ENVIRONMENT=demo
NEXT_PUBLIC_DEMO_MODE=true
DATABASE_URL=[demo-database-url]
NEXTAUTH_SECRET=[generated-secret]
NEXTAUTH_URL=https://viridian-[your-deployment].vercel.app
```

### Step 4: Verify Deployment

```
Visit: https://viridian-xxx.vercel.app

✓ See demo banner at top
✓ Login with demo@test / password works
✓ Test data visible
✓ All features accessible
✓ No errors in console
```

---

## Post-Launch Communication

### Share with Stakeholders

Email template:

```
Subject: Viridian Demo - Ready for Feedback

Hi [Stakeholders],

Viridian is now live in demo mode at: [url]

DEMO LOGIN CREDENTIALS:
- Admin:    admin@demo.test / demo-password-123
- Teacher:  teacher@demo.test / demo-password-123
- Student:  student1@demo.test / demo-password-123
- Parent:   parent1@demo.test / demo-password-123

WHAT TO TEST:
- K12 Standards Interface (grades, performance tracking)
- Improv Mastery Tracker (skills & assessments)
- Messaging Center (communication between users)
- Polymath Magazine (content sharing)
- Parent portal (access to child's data)

IMPORTANT NOTES:
- This is a TEST environment with MOCK DATA ONLY
- No real student data is stored
- Real production launch with full security: November 2026
- Please report any bugs or UX feedback

TIMELINE:
- August: Demo feedback and iteration
- September-October: Build security and compliance
- November: Production launch ready

Questions? Contact: [email]

Thanks!
```

---

## Cleanup Instructions (When Moving to Production)

### Before Importing Real Data

```bash
# Delete demo data
npx prisma db push  # Use production schema

# Verify demo data removed
# Query to check:
SELECT COUNT(*) FROM "User" WHERE email LIKE '%demo%';
# Should return 0

# Create real data import script
# (will do in October)
```

---

## Troubleshooting

### Issue: Seed script fails

```bash
# Make sure migrations are applied
npx prisma migrate deploy

# Try seed again
npx ts-node prisma/seed-demo.ts
```

### Issue: Login doesn't work

```bash
# Check database connection
echo $DATABASE_URL

# Verify demo users were created
psql [DATABASE_URL]
SELECT email FROM "User" WHERE email LIKE '%demo%';
```

### Issue: Data not visible after login

```bash
# Check organization data
SELECT * FROM "Organization" WHERE slug = 'demo-charter-school';

# Verify user roles assigned
SELECT * FROM "OrganizationRole" WHERE "userId" = '[admin-id]';
```

---

## Environment Checklist

- [ ] Demo seed script created (`prisma/seed-demo.ts`)
- [ ] Demo seed script tested locally
- [ ] Demo banner component created
- [ ] Demo banner added to root layout
- [ ] Demo notice added to login page
- [ ] Privacy policy placeholder updated
- [ ] Environment variables set (`NEXT_PUBLIC_ENVIRONMENT=demo`)
- [ ] Build tested locally (`npm run build && npm start`)
- [ ] Code pushed to GitHub
- [ ] Vercel deployment successful
- [ ] Demo site accessible
- [ ] All demo features tested
- [ ] Demo credentials documented
- [ ] Stakeholders notified

---

**Status**: Ready for Week 3 Launch  
**Next**: Share demo link with stakeholders for feedback  
**After**: Begin September security implementation

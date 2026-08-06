# Viridian Architecture Guide

**Project**: Viridian - K12 Standards Mastery Tracker + Polymath Magazine  
**Version**: 1.0  
**Date**: August 6, 2026

---

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend Layer                       │
│  (Next.js 16, React 19, TypeScript, Tailwind CSS)      │
├─────────────────────────────────────────────────────────┤
│ • K12 Standards Interface     • Polymath Magazine        │
│ • Improv Mastery Tracker      • Messaging Center         │
│ • Admin Dashboards            • Class Management         │
├─────────────────────────────────────────────────────────┤
│              API Layer (Next.js Route Handlers)          │
│  (/api routes, NextAuth authentication)                │
├─────────────────────────────────────────────────────────┤
│                   Business Logic Layer                   │
│  • Mastery Calculations       • Content Publishing      │
│  • Standards Management       • Progress Tracking        │
├─────────────────────────────────────────────────────────┤
│               Data Access Layer (Prisma ORM)             │
├─────────────────────────────────────────────────────────┤
│                  Database Layer                          │
│    (Supabase PostgreSQL)                                │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16.2.6 (with Turbopack)
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS 4
- **Type Safety**: TypeScript 5.9.3 (strict mode)
- **Icons**: Standard HTML/CSS

### Backend
- **Runtime**: Node.js (via Vercel)
- **API**: Next.js Route Handlers (App Router)
- **Authentication**: NextAuth 4.24.14
- **ORM**: Prisma 5.15.0
- **Email**: Resend 6.12.4

### Database
- **Primary**: Supabase PostgreSQL
- **Type**: Relational (normalized)
- **Connection**: Pooled via Supabase
- **Backups**: Automatic daily

### Deployment
- **Platform**: Vercel (Next.js optimized)
- **CI/CD**: GitHub → Vercel (auto-deploy on push)
- **Monitoring**: Vercel Analytics

---

## Directory Structure

```
viridian/
├── app/
│   ├── api/                          # API routes
│   │   ├── auth/                     # Authentication
│   │   ├── communities/              # Community management
│   │   ├── improv/                   # Improv mastery endpoints
│   │   ├── k12-classes/              # K12 class endpoints
│   │   ├── organizations/            # Org management
│   │   ├── polymath/                 # Polymath Magazine API
│   │   ├── standards/                # Standards management
│   │   └── ...
│   ├── components/                   # React components
│   │   ├── K12StandardsInterface.tsx
│   │   ├── PolymathPostingForm.tsx
│   │   ├── MessageCenter.tsx
│   │   └── ...
│   ├── auth/                         # Auth pages
│   ├── curator/                      # Curator dashboard
│   ├── organization/                 # Org pages
│   ├── polymath/                     # Polymath Magazine
│   │   ├── landing/
│   │   ├── feed/
│   │   ├── article/
│   │   └── ...
│   ├── dashboard/                    # Main dashboard
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles
├── lib/
│   ├── api/                          # API client functions
│   ├── auth.ts                       # Auth utilities
│   ├── prisma.ts                     # Prisma client
│   ├── mastery/
│   │   ├── calculations.ts           # Mastery calculation logic
│   │   └── calculations.test.ts      # Tests
│   └── ...
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── migrations/                   # Migration files
│   └── seed.ts                       # Database seed
├── public/                           # Static assets
├── scripts/                          # Utility scripts
├── docs/                             # Documentation
│   ├── API_REFERENCE.md
│   ├── ARCHITECTURE.md
│   ├── K12_MASTERY_RESEARCH.md
│   └── ...
├── .env                              # Environment variables (prod)
├── .env.local                        # Environment variables (dev)
├── next.config.ts                    # Next.js config
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind config
└── package.json                      # Dependencies
```

---

## Database Schema (Key Tables)

### Core Standards Tables
- **Standard**: Content/skill standards with pass percentage thresholds
- **ExampleObjective**: Learning objectives within standards (with mandatory flag)
- **Unit**: Organizational grouping for content standards
- **SkillCategory**: Organizational grouping for skill standards

### K12 Classes
- **K12Class**: High school humanities classes
- **K12Enrollment**: Student enrollment in K12 classes
- **K12Week**: Weekly organization of course content
- **ClassStandard**: Linking standards to classes

### Improv Classes
- **ImprovClass**: Improv training classes
- **ImprovEnrollment**: Student enrollment
- **ImprovSkill**: Improv skills catalog
- **ImprovObjective**: Learning objectives within skills

### Progress Tracking
- **StudentStandardProgress**: Student mastery of standards
- **StudentObjectiveProgress**: Student completion of objectives
- **ImprovSkillAssessment**: Skill assessments and ratings

### Polymath Publishing
- **PolymathArticle**: Published articles
- **PolymathTool**: Interactive tools
- **PolymathModule**: Structured learning modules
- **PolymathResourceCollection**: Resource collections

### Messaging
- **Conversation**: Chat threads (direct, class, org, event)
- **ConversationParticipant**: Conversation membership
- **Message**: Individual messages

---

## API Architecture

### Route Organization
```
/api/
├── /auth/[...nextauth]/         # NextAuth endpoints
├── /communities/:slug/
│   ├── /polymath/               # Community publishing
│   └── /...
├── /improv/
│   ├── /classes/:classId/       # Improv class endpoints
│   └── /...
├── /k12-classes/:classId/       # K12 class endpoints
├── /organizations/:slug/
│   ├── /k12-classes/            # Org K12 classes
│   └── /...
├── /polymath/
│   ├── /magazine                # Public content API
│   └── /...
├── /standards/                  # Standards management
└── /...
```

### Request/Response Cycle

1. **Client Request** → Next.js Route Handler
2. **Authentication** → NextAuth session check
3. **Authorization** → Role/permission check (if needed)
4. **Validation** → Input validation
5. **Business Logic** → Mastery calculations, etc.
6. **Database** → Prisma ORM query
7. **Response** → JSON response or error

### Error Handling Strategy

All API routes follow consistent error handling:
```typescript
try {
  // Validate input
  if (!validInput) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  
  // Check auth
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Process request
  const result = await prisma.standard.findUnique(...);
  
  // Return success
  return NextResponse.json(result, { status: 200 });
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json({ error: 'Server error' }, { status: 500 });
}
```

---

## Mastery Calculation Pipeline

### Flow
```
Student Completes Objective
         ↓
StudentObjectiveProgress updated
         ↓
Trigger mastery recalculation
         ↓
Fetch all objectives for standard
         ↓
Apply mastery rules:
  1. Check mandatory objective compliance
  2. Calculate completion percentage
  3. Compare against pass threshold
         ↓
Update StudentStandardProgress
         ↓
Update UI with new status
```

### Mastery Rules (Research-Based)

**Content Standards**:
- Default threshold: 80%
- Must pass all mandatory objectives first
- Can override per-standard

**Skill Standards**:
- Default threshold: 75%
- Aligns with AP College Board recommendations
- Configurable by organization

**Calculation**:
```
hasMastery = (
  allMandatoryObjectivesPassed AND
  completionPercentage >= passPercentage
)
```

---

## Authentication & Authorization

### NextAuth Flow

1. **Signup**: Create user in database
2. **Login**: Verify credentials, create session
3. **Session**: Stored securely via NextAuth
4. **Logout**: Invalidate session

### Role-Based Access Control

```typescript
// Organization Roles
- SuperAdmin: All access
- SchoolAdmin: Organization management
- Teacher: Class management + student grading
- Student: Class access + self-assessment

// Community Roles
- Curator: Create/edit community content
- Moderator: Review and approve content
- Member: View and participate

// Polymath Roles
- Author: Create articles/tools/modules
- Moderator: Approve community content
- Viewer: Read published content
```

### Permission Model

Checks are performed at:
- **Route level**: Middleware checks auth
- **Database level**: Queries filtered by user role
- **API level**: Return 403 if unauthorized

---

## Deployment Pipeline

### Local Development
```bash
npm run dev
# Runs on http://localhost:3000
```

### Staging (Branch)
```bash
git push origin dev
# Auto-deploys to staging environment
```

### Production (Main)
```bash
git push origin main
# Auto-deploys to production (Vercel)
# Takes ~2-3 minutes
```

### Environment Variables

**Development** (`.env.local`):
- DATABASE_URL (dev Supabase)
- NEXTAUTH_SECRET (dev)
- NEXTAUTH_URL=localhost:3000

**Production** (Vercel dashboard):
- DATABASE_URL (prod Supabase, same pool)
- NEXTAUTH_SECRET (prod, rotated)
- NEXTAUTH_URL=yourdomain.vercel.app

---

## Performance Considerations

### Database Optimization
- Prisma query optimization (select specific fields)
- Indexed columns on frequently queried fields
- Batch operations where possible

### Frontend Optimization
- Code splitting via Next.js dynamic imports
- Image optimization (next/image)
- CSS-in-JS with Tailwind (tree-shaking)

### Caching Strategy
- Browser caching: Static assets (images, fonts)
- API caching: Vercel edge caching (5 minutes default)
- Client-side caching: React Query for API data

### Bundle Size
- ~300KB (gzip) including all features
- Turbopack compilation time: <1s in dev

---

## Monitoring & Logging

### Available Dashboards
- **Vercel**: Deployment status, performance metrics
- **Supabase**: Database metrics, backups
- **Browser Console**: Client-side errors

### Logging Strategy
- Server logs: Vercel dashboard
- Client logs: Browser dev tools
- Error tracking: Console error handler

### Key Metrics to Monitor
- Page load time
- API response time
- Database query performance
- Error rate
- Authentication success rate

---

## Future Architecture Improvements (Phase 2+)

1. **Caching Layer**: Redis for mastery calculation caching
2. **Message Queue**: Background jobs for exports/reports
3. **Analytics**: Custom analytics pipeline
4. **Search**: Elasticsearch for advanced Polymath search
5. **Real-time**: WebSockets for collaborative features
6. **CDN**: Cloudflare for edge caching

---

## Development Workflow

### Adding a New Endpoint

1. **Schema Change** (if needed)
   ```prisma
   // Add to prisma/schema.prisma
   model NewEntity { ... }
   ```
   ```bash
   npx prisma migrate dev --name add_new_entity
   ```

2. **Create Route**
   ```typescript
   // app/api/route-name/route.ts
   export async function GET/POST/PATCH/DELETE(request, { params }) { ... }
   ```

3. **Add Types**
   ```typescript
   // types or inline in route
   interface RequestBody { ... }
   ```

4. **Test**
   ```bash
   npm run dev
   # Test at http://localhost:3000/api/route-name
   ```

5. **Commit**
   ```bash
   git add .
   git commit -m "feat(api): Add new endpoint"
   git push origin main
   ```

---

## Troubleshooting

### Build Failures
- Clear cache: `rm -rf .next node_modules`
- Reinstall: `npm install`
- Rebuild: `npm run build`

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Supabase connection status
- Review Supabase logs

### Auth Problems
- Verify NEXTAUTH_URL matches domain
- Check NEXTAUTH_SECRET is set
- Clear browser cookies

### Deployment Hangs
- Check Vercel dashboard for build logs
- Verify no database locks
- Try manual redeploy

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs

---

**Last Updated**: August 6, 2026  
**Maintainer**: Kyle Winslow Smith  
**Status**: Production Ready

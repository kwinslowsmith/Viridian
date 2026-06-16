# Day 1 Implementation Plan: Auth & Schema

**Date:** June 10, 2026  
**Goal:** Complete authentication system + database schema migration  
**Success:** Users can sign up, verify email, log in. Curator can create communities.

---

## PHASE 1: SETUP (1 hour)

### 1.1 Install Dependencies
```bash
npm install next-auth@latest nodemailer bcryptjs
npm install -D @types/bcryptjs
```

### 1.2 Create Auth Environment Variables
```env
# .env.local (add to existing)
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000

# Resend
RESEND_API_KEY=<get from resend.com free tier>
```

### 1.3 NextAuth Directory Structure
```
app/
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts
├── auth/
│   ├── signup/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   └── verify-email/
│       └── page.tsx
└── ...
```

---

## PHASE 2: DATABASE SCHEMA (2 hours)

### 2.1 Update User Model
**File:** `prisma/schema.prisma`

Replace existing User model:
```prisma
model User {
  id                        String   @id @default(cuid())
  email                     String   @unique
  name                      String
  passwordHash              String?  // bcrypt hash
  emailVerified             Boolean  @default(false)
  emailVerificationToken    String?  @unique // temp token for verification
  
  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt

  // Relations
  organizationRoles         OrganizationRole[]
  learningCommunityMemberships LearningCommunityMember[]
  curatedCommunities        LearningCommunity[] @relation("CuratedBy")
  studentPreferences        StudentPreference[]
  joinRequests              CommunityJoinRequest[]
  
  // For NextAuth
  accounts                  Account[]
  sessions                  Session[]

  @@index([email])
  @@index([emailVerificationToken])
}

// NextAuth Models (required)
model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?  @db.Text
  access_token       String?  @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?  @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### 2.2 Add Community Models
```prisma
model LearningCommunity {
  id                      String   @id @default(cuid())
  slug                    String   @unique
  name                    String
  description             String?
  coverImage              String?
  
  scope                   String   // "global" | "organization"
  organizationId          String?
  organization            Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  curatorId               String
  curator                 User     @relation("CuratedBy", fields: [curatorId], references: [id], onDelete: Cascade)
  
  status                  String   @default("draft")  // "draft" | "pending-approval" | "active" | "archived"
  isPublic                Boolean  @default(true)
  requiresApprovalToJoin  Boolean  @default(false)
  approvedAt              DateTime?
  approvedById            String?
  
  topic                   String?  // "education", "career", "life-skills"
  difficulty              String?  // "beginner", "intermediate", "advanced"
  estimatedHours          Int?
  
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  modules                 LearningModule[]
  members                 LearningCommunityMember[]
  joinRequests            CommunityJoinRequest[]

  @@unique([organizationId, slug])
  @@index([scope])
  @@index([status])
  @@index([topic])
  @@index([curatorId])
}

model LearningModule {
  id                      String   @id @default(cuid())
  communityId             String
  community               LearningCommunity @relation(fields: [communityId], references: [id], onDelete: Cascade)

  title                   String
  description             String?
  sequenceNum             Int
  estimatedHours          Int?

  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  @@unique([communityId, sequenceNum])
  @@index([communityId])
}

model LearningCommunityMember {
  id                      String   @id @default(cuid())
  communityId             String
  community               LearningCommunity @relation(fields: [communityId], references: [id], onDelete: Cascade)

  userId                  String
  user                    User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  role                    String   @default("member")  // "member" | "curator" | "moderator"
  status                  String   @default("active")  // "active" | "suspended" | "left"
  joinedAt                DateTime @default(now())
  progress                Float    @default(0)

  @@unique([communityId, userId])
  @@index([communityId])
  @@index([userId])
  @@index([status])
}

model CommunityJoinRequest {
  id                      String   @id @default(cuid())
  communityId             String
  community               LearningCommunity @relation(fields: [communityId], references: [id], onDelete: Cascade)

  userId                  String
  user                    User     @relation(fields: [userId], references: [id])

  status                  String   @default("pending")  // "pending" | "approved" | "rejected"
  requestedAt             DateTime @default(now())
  respondedAt             DateTime?
  respondedById           String?

  @@unique([communityId, userId])
  @@index([communityId])
  @@index([status])
}
```

### 2.3 Update Organization Model
Add to existing Organization:
```prisma
model Organization {
  // ... existing fields ...
  
  slug                    String   @unique
  logo                    String?
  curatorName             String?
  curatorBio              String?

  // Add to relations
  learningCommunities     LearningCommunity[]  // Communities this org curates

  @@index([slug])
}
```

### 2.4 Update StudentPreference Model
```prisma
model StudentPreference {
  id                      String   @id @default(cuid())
  userId                  String
  user                    User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  organizationId          String?
  organization            Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  preferredMaterialTypes  String?  // "video,article,worksheet"
  learningInterests       String?  // "economics,history,math"
  preferredTopics         String?  // "career,education,life-skills"
  
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  @@unique([userId, organizationId])
  @@index([userId])
}
```

### 2.5 Run Migration
```bash
npx prisma migrate dev --name "add_auth_and_communities"
npx prisma generate
```

---

## PHASE 3: NEXTAUTH SETUP (45 minutes)

### 3.1 Create NextAuth Configuration
**File:** `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        if (!user.emailVerified) {
          throw new Error("Please verify your email first");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name
        };
      }
    })
  ],
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/signup"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

## PHASE 4: AUTH PAGES (1 hour)

### 4.1 Signup Page
**File:** `app/auth/signup/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { colors } from '@/app/modules/improv/design/colors';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', name: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      setSuccess('Check your email to verify your account!');
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
      <div className="w-full max-w-md p-8 rounded-lg" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
        <h1 className="text-3xl font-bold mb-6" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
          Create Account
        </h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 rounded border"
            style={{ borderColor: colors.border, color: colors.text }}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 rounded border"
            style={{ borderColor: colors.border, color: colors.text }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 rounded border"
            style={{ borderColor: colors.border, color: colors.text }}
            required
          />

          {error && <div style={{ color: '#ef4444' }}>{error}</div>}
          {success && <div style={{ color: '#4DAB7E' }}>{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded font-semibold"
            style={{ backgroundColor: colors.teal.bg, color: colors.text, opacity: loading ? 0.5 : 1 }}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ color: colors.text2, marginTop: '1rem', textAlign: 'center' }}>
          Already have an account? <a href="/auth/login" style={{ color: colors.teal.accent, textDecoration: 'underline' }}>Login</a>
        </p>
      </div>
    </div>
  );
}
```

### 4.2 Login Page
**File:** `app/auth/login/page.tsx`

[Similar structure to signup, uses `signIn` from next-auth/react]

### 4.3 Email Verification Page
**File:** `app/auth/verify-email/page.tsx`

[Handles email token verification]

---

## PHASE 5: AUTH API ENDPOINTS (1 hour)

### 5.1 Signup Endpoint
**File:** `app/api/auth/signup/route.ts`

```typescript
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = uuid();

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        emailVerificationToken: verificationToken
      }
    });

    // Send verification email
    await resend.emails.send({
      from: 'noreply@viridian.dev',
      to: email,
      subject: 'Verify your email',
      html: `
        <p>Welcome to Viridian!</p>
        <p><a href="${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}">Verify your email</a></p>
      `
    });

    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json(
      { error: 'Signup failed' },
      { status: 500 }
    );
  }
}
```

### 5.2 Verify Email Endpoint
**File:** `app/api/auth/verify-email/route.ts`

[Handles email token verification, sets `emailVerified: true`]

---

## PHASE 6: UPDATE HOME PAGE (30 min)

### 6.1 Replace Role Selector with Auth Nav
**File:** `app/page.tsx` (modify export default Home function)

```typescript
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { colors } from '@/app/modules/improv/design/colors';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
            Viridian
          </h1>
          <p className="text-lg mb-8" style={{ color: colors.text2 }}>Global Learning Communities</p>
          <div className="space-x-4">
            <Link href="/auth/signup" className="px-6 py-3 rounded font-semibold" style={{ backgroundColor: colors.teal.bg, color: colors.text }}>
              Sign Up
            </Link>
            <Link href="/auth/login" className="px-6 py-3 rounded font-semibold border" style={{ borderColor: colors.border, color: colors.text }}>
              Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Authenticated: show dashboard nav (existing code, but with logout button)
  return (
    <main className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <nav className="p-4 flex justify-between items-center" style={{ backgroundColor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ color: colors.text, fontWeight: 'bold' }}>Viridian</div>
        <div>
          <span style={{ color: colors.text, marginRight: '1rem' }}>{session.user?.name}</span>
          <button onClick={() => signOut()} className="px-4 py-2 rounded" style={{ backgroundColor: colors.bg, color: colors.text }}>
            Logout
          </button>
        </div>
      </nav>
      {/* Existing dashboard code */}
    </main>
  );
}
```

---

## CHECKLIST

- [ ] Install dependencies (bcryptjs, next-auth, resend)
- [ ] Add env variables (.env.local)
- [ ] Update User model + add auth models
- [ ] Add LearningCommunity + related models
- [ ] Run prisma migration
- [ ] Create NextAuth config
- [ ] Create auth pages (signup, login, verify-email)
- [ ] Create auth API endpoints
- [ ] Update home page with auth
- [ ] Test signup flow end-to-end
- [ ] Verify email works with Resend
- [ ] Test login
- [ ] Build passes

---

## SUCCESS CRITERIA

✅ User can sign up with email/password  
✅ Email verification sent via Resend  
✅ User can verify email and unlock login  
✅ User can log in  
✅ Session persists across page reloads  
✅ Logout works  
✅ Build passes with no errors  
✅ Database schema ready for communities  

---

**Next:** Day 2 will build community CRUD + discovery API


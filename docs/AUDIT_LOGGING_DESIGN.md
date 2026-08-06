# Audit Logging Design Document

**Task**: #11 - Implement audit logging for all student data access  
**Purpose**: Track all access to student data for FERPA/201 CMR 17.00 compliance  
**Retention**: 7+ years (immutable)  
**Status**: Design Phase (Ready for Implementation September)

---

## Overview

Audit logging captures every access to student education records. Massachusetts law requires:
- **Who** accessed the data
- **What** data was accessed
- **When** it was accessed
- **Where** (IP address) it was accessed from
- **Why/How** (action type: view, edit, delete)
- **Result** (success or denied)

---

## Database Schema

### AuditLog Table

```prisma
model AuditLog {
  id                String   @id @default(cuid())
  
  // WHO: User performing action
  userId            String   // Teacher, admin, parent, or student
  user              User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  userName          String   // Cached for deleted users
  userRole          String   // "teacher", "admin", "student", "parent"
  
  // WHAT: Resource accessed
  resourceType      String   // "student", "grades", "performance", "class", "objectives"
  resourceId        String   // ID of the resource (student ID, grade ID, etc.)
  resourceName      String   // Cached name (e.g., "John Smith" for student)
  
  // WHAT: Specific data
  dataFields        String?  // Comma-separated: "name,grades,performance"
  sensitiveData     Boolean  @default(false) // True if PII accessed
  
  // WHEN: Timestamp
  timestamp         DateTime @default(now())
  
  // WHERE: Request context
  ipAddress         String?  // Client IP
  userAgent         String?  // Browser/app
  sessionId         String?  // Session token (for correlation)
  
  // HOW: Action
  action            String   // "view", "edit", "delete", "create", "export"
  actionDetails     String?  // Additional context (e.g., "bulk download")
  
  // RESULT: Outcome
  status            String   // "success", "denied", "error"
  errorMessage      String?  // If denied or error
  
  // RELATIONSHIP: What was accessed
  studentId         String?  // If student data accessed
  classId           String?  // If class data accessed
  parentId          String?  // If parent accessed child data
  
  // RETENTION & COMPLIANCE
  createdAt         DateTime @default(now())
  archived          Boolean  @default(false) // For retention management
  
  // IMMUTABILITY: Prevent tampering
  checksumHash      String?  // Hash of log entry for integrity check
  
  @@index([userId])
  @@index([resourceType])
  @@index([timestamp])
  @@index([studentId])
  @@index([status])
  @@index([sensitiveData])
}
```

---

## What to Log

### Critical Access (Always Log)

```typescript
// Student grades viewed by teacher
✅ LOG {
  userId: "teacher_123",
  userRole: "teacher",
  resourceType: "grades",
  resourceId: "grade_456",
  action: "view",
  studentId: "student_789",
  classId: "class_001",
  status: "success"
}

// Parent views child's performance data
✅ LOG {
  userId: "parent_123",
  userRole: "parent",
  resourceType: "performance",
  resourceId: "perf_456",
  action: "view",
  studentId: "student_789",
  parentId: "parent_123",
  status: "success"
}

// Admin views all student data
✅ LOG {
  userId: "admin_123",
  userRole: "admin",
  resourceType: "student",
  resourceId: "student_789",
  action: "view",
  dataFields: "name,grades,performance,notes",
  status: "success"
}

// Teacher tries to view student outside their class (DENIED)
✅ LOG {
  userId: "teacher_123",
  userRole: "teacher",
  resourceType: "grades",
  resourceId: "grade_456",
  studentId: "student_789",
  action: "view",
  status: "denied",
  errorMessage: "Student not in your class"
}

// Student exports their grades (bulk download)
✅ LOG {
  userId: "student_123",
  userRole: "student",
  resourceType: "grades",
  action: "export",
  actionDetails: "bulk_download_100_records",
  status: "success",
  sensitiveData: true
}
```

### API Endpoints to Log

**Student Data Endpoints** (all should log):
- `GET /api/organizations/:slug/k12-classes/:classId/standards` → Students accessed
- `PATCH /api/standards/:standardId/objectives/:objectiveId` → Objective modified
- `GET /api/improv/classes/:classId/progress-summary` → Class data accessed
- `GET /api/improv/classes/:classId/students/:studentId/progress` → Student progress viewed

**Parent Portal** (all should log):
- Login attempts (success/failure)
- Data accessed (child's grades, progress)
- Any exports/downloads

**Admin Endpoints** (all should log):
- Access to student data
- Access to audit logs themselves
- Configuration changes

---

## Logging Implementation

### Middleware Approach

Create a logging middleware to capture all API requests:

```typescript
// lib/logging/auditMiddleware.ts

export async function auditLog(
  userId: string,
  resourceType: string,
  action: "view" | "edit" | "delete" | "create" | "export",
  resourceId: string,
  options?: {
    studentId?: string;
    classId?: string;
    dataFields?: string[];
    sensitiveData?: boolean;
    status?: "success" | "denied" | "error";
    errorMessage?: string;
    actionDetails?: string;
  }
) {
  // Log to database
  const log = await prisma.auditLog.create({
    data: {
      userId,
      userRole: getUserRole(userId),
      resourceType,
      resourceId,
      action,
      timestamp: new Date(),
      ipAddress: getClientIp(), // from request headers
      userAgent: getUserAgent(), // from request headers
      sessionId: getSessionId(), // from NextAuth
      ...options,
    },
  });
  
  return log;
}

// Usage in API route:
export async function GET(request: NextRequest, { params }) {
  const session = await getServerSession();
  const studentData = await prisma.student.findUnique(...);
  
  // Log the access
  await auditLog(
    session.user.id,
    "grades",
    "view",
    studentData.id,
    {
      studentId: studentData.id,
      dataFields: ["name", "grades"],
      sensitiveData: true,
      status: "success"
    }
  );
  
  return NextResponse.json(studentData);
}
```

### Request Wrapper Pattern

```typescript
// lib/logging/withAudit.ts

export function withAudit(
  resourceType: string,
  action: "view" | "edit" | "delete" | "create" | "export"
) {
  return async (handler: any) => {
    return async (request: NextRequest, { params }: any) => {
      const session = await getServerSession();
      
      try {
        const result = await handler(request, { params });
        
        // Log on success
        await auditLog(session.user.id, resourceType, action, params.id, {
          status: "success"
        });
        
        return result;
      } catch (error) {
        // Log on error
        await auditLog(session.user.id, resourceType, action, params.id, {
          status: "error",
          errorMessage: error.message
        });
        
        throw error;
      }
    };
  };
}

// Usage:
export const GET = withAudit("grades", "view")(async (request, { params }) => {
  return NextResponse.json(studentData);
});
```

---

## Audit Log Access & Querying

### Who Can Access Logs?

```typescript
// Only admins can view audit logs
if (userRole !== "admin") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Log the fact that admin viewed audit logs
await auditLog(userId, "audit_log", "view", "all_logs", {
  status: "success",
  sensitiveData: true
});
```

### Query Interface

```typescript
// lib/logging/queries.ts

export async function getAuditLogs(filters: {
  userId?: string;
  studentId?: string;
  resourceType?: string;
  dateRange?: { from: Date; to: Date };
  limit?: number;
}) {
  const logs = await prisma.auditLog.findMany({
    where: {
      userId: filters.userId,
      studentId: filters.studentId,
      resourceType: filters.resourceType,
      timestamp: filters.dateRange ? {
        gte: filters.dateRange.from,
        lte: filters.dateRange.to,
      } : undefined,
    },
    orderBy: { timestamp: "desc" },
    take: filters.limit || 100,
  });
  
  return logs;
}

// Get all access to a specific student
export async function getStudentAccessLog(studentId: string) {
  return getAuditLogs({ studentId });
}

// Get all access by a specific user
export async function getUserAccessLog(userId: string) {
  return getAuditLogs({ userId });
}
```

---

## Retention & Archival

### 7-Year Retention Policy

```typescript
// lib/logging/retention.ts

export async function archiveOldLogs() {
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - 7);
  
  // Move logs older than 7 years to archive
  const archived = await prisma.auditLog.updateMany({
    where: {
      createdAt: { lt: cutoffDate },
      archived: false,
    },
    data: {
      archived: true,
    },
  });
  
  return archived;
}

// Schedule this to run daily
// (use a cron job or scheduled task)
```

### Immutability

```typescript
// Logs cannot be updated or deleted
// Prevent direct mutations:

// ❌ DON'T allow this:
await prisma.auditLog.update({
  where: { id: logId },
  data: { action: "view" } // DENIED
});

// ❌ DON'T allow this:
await prisma.auditLog.delete({
  where: { id: logId }
});

// ✅ Only allow read-only access:
const logs = await prisma.auditLog.findMany({
  where: { userId: "teacher_123" }
});
```

### Integrity Checking

```typescript
// Optional: Add checksum to detect tampering

export function generateChecksum(log: AuditLog): string {
  const data = JSON.stringify({
    userId: log.userId,
    action: log.action,
    resourceId: log.resourceId,
    timestamp: log.timestamp.toISOString(),
  });
  
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex");
}

// Store checksum when creating log
const log = await prisma.auditLog.create({
  data: {
    ...logData,
    checksumHash: generateChecksum(logData),
  },
});

// Verify on retrieval (optional)
export function verifyLogIntegrity(log: AuditLog): boolean {
  const calculated = generateChecksum(log);
  return calculated === log.checksumHash;
}
```

---

## Performance Considerations

### Indexing Strategy

```prisma
@@index([userId])           // Find all logs by user
@@index([studentId])        # Find all access to student
@@index([timestamp])        # Range queries by date
@@index([resourceType])     # Filter by resource type
@@index([status])           # Find denials/errors
@@index([sensitiveData])    # Find PII access
```

### Query Optimization

```typescript
// ❌ SLOW: Full scan
const logs = await prisma.auditLog.findMany();

// ✅ FAST: Use indexes, limit
const logs = await prisma.auditLog.findMany({
  where: {
    studentId: "student_123",
    timestamp: { gte: startDate, lte: endDate }
  },
  take: 100,
  orderBy: { timestamp: "desc" }
});
```

### Database Size

Estimate:
- ~50 students × ~20 teachers = 1,000 log entries/day per class
- 10 classes = 10,000 entries/day
- 7-year retention = 25M entries
- ~5 GB of storage (compress archived logs)

**Mitigation**:
- Archive older logs to cold storage
- Compress archived logs
- Regular cleanup of test data

---

## Admin Dashboard

Create UI for admins to review logs:

```typescript
// app/admin/audit-logs/page.tsx

export default function AuditLogsPage() {
  return (
    <div>
      <h1>Audit Logs</h1>
      
      {/* Filters */}
      <Filters onFilter={(filters) => {
        const logs = await getAuditLogs(filters);
      }} />
      
      {/* Log table */}
      <AuditLogTable logs={logs} />
      
      {/* Export option */}
      <button onClick={exportLogs}>
        Export to CSV (for legal/compliance reviews)
      </button>
    </div>
  );
}
```

---

## Compliance Notes

### FERPA Requirements
- ✅ Every access logged
- ✅ Cannot be modified (immutable)
- ✅ 7+ year retention
- ✅ Access restricted to admins
- ✅ Access to logs itself is logged

### 201 CMR 17.00 Requirements
- ✅ Activity logging
- ✅ Record what data accessed
- ✅ Timestamp for each access
- ✅ Identify who accessed
- ✅ Cannot be tampered with

### Incident Response
- ✅ Enables breach investigation
- ✅ Proves what data was accessed
- ✅ Shows if breach occurred
- ✅ Demonstrates security controls

---

## Implementation Roadmap

### Week 1 (September)
- [ ] Create `AuditLog` model in Prisma schema
- [ ] Run migration: `npx prisma migrate dev`
- [ ] Create audit logging service (`lib/logging/audit.ts`)
- [ ] Create query interface (`lib/logging/queries.ts`)

### Week 2 (September)
- [ ] Add logging to K12 Standards endpoints
- [ ] Add logging to Improv endpoints
- [ ] Add logging to authentication (login attempts)
- [ ] Add logging to admin endpoints

### Week 3 (September)
- [ ] Create admin dashboard for viewing logs
- [ ] Add export functionality (CSV)
- [ ] Add retention/archival script
- [ ] Test logging works end-to-end

### Week 4 (September)
- [ ] Performance testing
- [ ] Query optimization
- [ ] Documentation
- [ ] Staff training on log review

---

## Testing Strategy

```typescript
// __tests__/audit-logging.test.ts

describe("Audit Logging", () => {
  test("logs when teacher views student grades", async () => {
    // Simulate teacher accessing grades
    const response = await GET("/api/students/123/grades");
    
    // Verify log entry created
    const logs = await getAuditLogs({ userId: "teacher_123" });
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      action: "view",
      resourceType: "grades",
      status: "success"
    });
  });
  
  test("logs when access is denied", async () => {
    // Simulate teacher trying to access student outside their class
    const response = await GET("/api/students/999/grades");
    
    // Verify denial logged
    const logs = await getAuditLogs({ userId: "teacher_123" });
    expect(logs[0].status).toBe("denied");
  });
});
```

---

## Deployment Checklist

- [ ] Prisma migration applied to production
- [ ] Audit logging service deployed
- [ ] Logging added to all student data endpoints
- [ ] Admin dashboard working
- [ ] Retention policy in place
- [ ] Backup & recovery tested
- [ ] Staff trained on log review
- [ ] Documentation updated

---

**Status**: Design Complete - Ready for Implementation  
**Next**: Begin implementation in Week 1 of September  
**Owner**: Engineering Team

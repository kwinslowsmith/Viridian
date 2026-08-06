# Student Data Security & Compliance Research

**Project**: Viridian (K12 Standards Mastery Tracker + Polymath Magazine)  
**Organization**: Massachusetts Public Charter School  
**Research Date**: August 6, 2026  
**Status**: Ready for Legal Team Review

---

## Executive Summary

Your application handles sensitive student education records (names, grades, performance data) for Massachusetts public charter school students ages 13+. You must comply with **three layers of regulation**:

1. **Federal**: FERPA (Family Educational Rights and Privacy Act)
2. **State**: Massachusetts General Law Chapter 93H + 201 CMR 17.00 + 603 CMR 23.00
3. **School**: Charter school data policies and board oversight

**Critical Finding**: Massachusetts 201 CMR 17.00 is **stricter than HIPAA** (healthcare). It treats schools the same as banks and healthcare providers. Penalties: **$5,000 per violation**.

---

## Layer 1: Federal Compliance (FERPA)

### What is FERPA?
- Federal law (1974) protecting student education records
- Applies to ALL schools receiving federal funding (includes public charter schools)
- Penalties: Loss of federal funding for non-compliance

### Key FERPA Rights
**Parents and eligible students have the right to**:
1. **Inspect & Review**: Access education records within 45 days of request
2. **Request Amendment**: Challenge inaccurate/misleading records
3. **Control Disclosure**: Restrict who can access their records
4. **Receive Notice**: Know about FERPA rights and school policies

### FERPA Definitions (Important for Your App)

**"Education Record"** = Any information maintained by school relating to student
- Includes names, student ID, grades, performance data, behavioral notes
- **Your app stores**: Names, grades, performance data = FERPA records
- **Applies to**: Digital systems, online portals, databases

**"Personally Identifiable Information" (PII)** = Info that can identify student
- Student name + any other identifier (ID number, email, grades)
- Your app PII: Student name + grades + performance = PII

### FERPA Access Rules

**Who can access WITHOUT parental consent**:
- School officials with "legitimate educational interest"
  - Teachers of the student ✓
  - Administrators managing the student ✓
  - Counselors advising the student ✓
  - NOT random staff without need to know ✗

**Who can access WITH written consent**:
- Parents (can revoke anytime)
- Eligible students (18+ or in postsecondary)
- Third-party vendors (with Data Processing Agreement)

### FERPA for Online Systems

**Key requirement**: If you provide an online portal for parents/students to access records:
- Must use secure authentication (username/password minimum)
- Must limit access to own records only
- Must maintain audit log of who accessed what, when
- Must follow session security (timeout after inactivity)
- Students/parents can revoke access anytime

**Your app implication**: 
- Parents accessing grades online → Must be secure, audit logged
- Students seeing own progress → Must be HTTPS + authentication
- Teachers accessing class roster → Must log access

---

## Layer 2: Massachusetts State Requirements

### Massachusetts General Law Chapter 93H (Data Security Law)

**Scope**: Broader than FERPA—covers ANY personal information of MA residents
- No exemptions for schools or nonprofits
- Applies to paper and electronic records
- Student data = automatically covered

**Requirements**: Create Written Information Security Program (WISP) with:

1. **Administrative Safeguards**
   - Designated security officer or team
   - Written policies & procedures
   - Staff training on data handling
   - Incident response plan
   - Third-party oversight (vendors)

2. **Technical Safeguards**
   - User authentication (strong passwords)
   - Access controls (role-based)
   - Encryption of data in transit and at rest
   - Network monitoring & firewalls
   - Activity logging & audit trails

3. **Physical Safeguards**
   - Secure facilities (locked servers)
   - Backup systems
   - Secure disposal of records
   - Control of physical access

### 201 CMR 17.00 (Detailed Technical Requirements)

**Key technical controls required**:

✅ **User Authentication**
- Strong passwords (complexity requirements)
- Account lockout after failed login attempts
- Multi-factor authentication (recommended)

✅ **Encryption**
- Data in transit: HTTPS/TLS required
- Data at rest: Encrypted database
- Test encryption regularly

✅ **Access Control**
- Limit access based on job role (role-based access control)
- Regular access reviews
- Revoke access when staff leave
- Audit log of all access

✅ **Network Security**
- Firewalls
- Intrusion detection
- Secure configuration
- Network monitoring

✅ **Data Retention**
- Keep student records for 7 years after graduation/departure
- Destroy records securely after retention period
- Document destruction process

### 603 CMR 23.00 (School Records Regulations)

**Specific to schools**:
- Principal is responsible for privacy/security of records
- Schools must have written student records policy
- Parents have right to access within 5 business days
- Student records must be kept confidential
- Staff handling records need training

### 603 CMR 28.00 (Student Discipline Records)

- Discipline records must be kept separate
- Access restricted to authorized personnel
- Destroyed 7 years after student leaves

---

## Layer 3: Parental & Student Consent

### What Requires Parental Consent?

**Massachusetts General Law Chapter 71, Section 34D**:
- **Requires consent** to share student PII with **third parties**
- Exception: Legitimate educational interest (school staff, etc.)

**For your app**:
- ✅ No consent needed: Teachers accessing class grades (legitimate ed interest)
- ✅ No consent needed: Student accessing own grades (their own record)
- ⚠️ **Consent needed**: Sharing data with vendors/third parties
- ⚠️ **Consent needed**: Parents accessing student records (student must authorize)

### Data Processing Agreement (DPA)

**If using vendors** (like Supabase for database):
- School district needs DPA with vendor
- Vendor must agree to same security standards
- Vendor liable for data breaches
- Cannot share data with sub-processors without approval

**Your situation**:
- Supabase = data processor (holds student data)
- Vercel = infrastructure provider
- **School district needs DPA with Supabase** (your responsibility to facilitate)

### Biometric Data (Special Rule)

- **Cannot** collect fingerprints, facial recognition, etc.
- Requires written consent + parent notification
- Your app doesn't do this ✓

---

## Data Breach Notification (Critical Requirement)

### Massachusetts Timeline

**"As soon as practicable and without unreasonable delay"**
- Interpreted as: **Days to weeks**, not months
- Generally: **Within 3-5 business days** of discovery

### Who to Notify

1. **Affected residents** (students, parents, staff)
2. **Massachusetts Attorney General**
3. **Office of Consumer Affairs & Business Regulation**
4. **Consumer reporting agencies** (if 1,000+ affected)

### Notification Content

Must include:
- Description of breach type
- Personal information exposed
- Steps individuals can take
- Contact information for breach inquiries

### If Data Was Encrypted

- May not need to notify if encryption key was NOT compromised
- Demonstrates strong security posture

---

## Your Current Architecture Assessment

### ✅ What You Have

- HTTPS/TLS (Vercel default) — data in transit encrypted
- Authentication (NextAuth) — access controlled
- Role-based users (teachers, admin, students, parents)
- Supabase PostgreSQL — supports encryption at rest

### ⚠️ What Needs Implementation

1. **Encryption at Rest** (database)
   - Enable Supabase encryption
   - Encrypt sensitive fields (grades, performance data)

2. **Audit Logging**
   - Log all access to student data
   - Who accessed what, when, from where
   - Store 7+ years
   - Make logs immutable (can't be deleted)

3. **Access Controls**
   - Student can only see own data ✓ (verify all endpoints)
   - Parent can only see authorized student data
   - Teacher can only see enrolled students
   - Admin has full access + audit logged

4. **Data Retention Policy**
   - Delete student data 7 years after graduation
   - Automated deletion process
   - Secure destruction

5. **Incident Response Plan**
   - How to detect breach
   - Who decides if notification needed
   - How to notify within days
   - How to preserve evidence

6. **Vendor Management**
   - DPA with Supabase (school district signs)
   - Security audit of Vercel
   - Annual vendor security review

7. **Privacy Policy & Terms**
   - Describe what data is collected
   - How it's used (grades, performance tracking)
   - Who can access (teachers, parents, students)
   - How long kept
   - Student/parent rights
   - Data breach notification plan

8. **Staff Training**
   - Annual FERPA training for all users
   - Data handling best practices
   - Incident reporting procedures
   - Password security
   - Phishing awareness

---

## Specific Scenarios for Your App

### Scenario 1: Teacher Accessing Student Grades

**Question**: Can teacher see student grades online?  
**Answer**: ✅ Yes, if:
- Teacher is teaching that student
- Grades are only for own class
- Access is logged
- System timeout after 30 min inactivity
- Strong password required

**Implementation needed**:
- Verify API only returns student's classes
- Log: Teacher ID, Student ID, Access Time, Data Accessed
- Implement session timeout
- Enforce password policy

### Scenario 2: Parent Accessing Student Grades

**Question**: Can parent see student grades online?  
**Answer**: ✅ Yes, if:
- **Student (if 18+) or parent (if 17-) authorizes access**
- Parent can only see child's data
- Separate login portal
- Access logged
- Can revoke anytime

**Implementation needed**:
- Student must explicitly grant parent access
- Cannot bulk share (must authorize each parent)
- Audit log of who parent accessed
- Parent can see what grades/data child shared
- Button to revoke access

### Scenario 3: Data Breach (hypothetical)

**Question**: Hacker accesses 100 students' grades. What happens?  
**Answer**: Within 3-5 days:
1. Contact MA Attorney General
2. Notify 100 students + parents
3. Notify consumer reporting agencies (if any SSNs exposed)
4. Preserve evidence (don't clean up)
5. Investigate what happened
6. Fix security gap

**Cost**: Notification + forensics + potentially $5,000s in fines + lawsuits

**Your system**: Don't expose SSNs (don't even collect them) = reduces liability

---

## Key Questions for Your Legal Team

1. **Which students will you serve?**
   - Ages 13+? ✓ (no COPPA issues)
   - All from Massachusetts? ✓ (can focus on MA law)

2. **Who owns the school data?**
   - Your school district owns it
   - You are a service provider
   - School must approve all policies

3. **Will you collect Social Security Numbers?**
   - Recommended: NO (not needed for grades/performance)
   - Adds liability if breached

4. **Will you handle special ed records (IEPs)?**
   - More sensitive than regular grades
   - Requires additional protections
   - Consider if needed

5. **Data Retention**
   - After student graduates, delete data after 7 years
   - Verify with school policy (may be shorter)

6. **Incidents**
   - Do you have cyber insurance?
   - Do you have incident response team?
   - Can you notify within 3-5 days?

---

## Recommended Implementation Order

### Phase 1: Critical (Before Launch)
1. ✅ Privacy Policy (legal team)
2. ✅ Data Processing Agreement (legal team + Supabase)
3. ✅ Audit Logging implementation (engineering)
4. ✅ Access Control verification (engineering)
5. ✅ Encryption at rest enablement (engineering)

### Phase 2: Important (Within 30 days)
1. Staff FERPA training program
2. Data retention/deletion automation
3. Incident response procedure documentation
4. Password policy enforcement
5. Session timeout implementation

### Phase 3: Ongoing
1. Annual security audits
2. Staff recertification (FERPA)
3. Vendor security review
4. Penetration testing
5. Breach notification drills

---

## Red Flags to Avoid

❌ **DON'T**:
- Store SSNs (not needed for grades)
- Log student data to console/files
- Allow one user to see another's data
- Share data with third parties without written consent
- Keep student data after 7 years
- Delay breach notification
- Have weak passwords or single-factor auth

✅ **DO**:
- Encrypt everything in transit (HTTPS)
- Log all access to student data
- Test access controls regularly
- Train staff on FERPA
- Have incident response plan
- Keep documentation of compliance decisions
- Get legal team to review policies

---

## Resources & References

### Massachusetts Specific
- [MA 201 CMR 17.00 Full Regulation](https://www.mass.gov/doc/201-cmr-17-standards-for-the-protection-of-personal-information-of-residents-of-the-commonwealth/download)
- [MA Data Security Law Guide](https://kahnlitwin.com/blogs/mission-matters-blog/are-you-up-to-speed-on-201-cmr-17-00)
- [MA Student Records Regulations (603 CMR 23.00)](https://www.masslegalservices.org/system/files/library/Massachusetts_Regs_Student_Records.doc)

### Federal FERPA
- [US Department of Education Student Privacy Resources](https://studentprivacy.ed.gov/)
- [FERPA Regulations (34 CFR Part 99)](https://www.congress.gov/crs-product/R46799)
- [FERPA Compliance Checklist](https://www.brightdefense.com/blog/ferpa-compliance-checklist/)

### Incident Response
- [MA Data Breach Notification Requirements](https://www.mass.gov/info-details/requirements-for-data-breach-notifications)
- [Breach Notification Timeline Guide](https://www.recordinglaw.com/us-laws/data-privacy-laws/massachusetts-data-privacy-laws/data-breach-notification/)

### Best Practices
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [K-12 Cybersecurity Best Practices](https://k12cybersecure.com/)
- [OWASP Top 10 for Education](https://owasp.org/www-project-top-ten/)

---

## Next Steps

1. **Share this with legal team** — They'll review compliance requirements
2. **Charter school board** — May need board approval for data policies
3. **Data Processing Agreement** — School district + Supabase
4. **Staff Training** — FERPA training requirements
5. **Implementation Planning** — Based on research findings

---

## Summary for Legal Team

**Required Compliance**:
- ✅ FERPA (federal law)
- ✅ MA Chapter 93H (state data security law)
- ✅ 201 CMR 17.00 (detailed technical standards)
- ✅ 603 CMR 23.00 (school records rules)
- ✅ Data breach notification (within days)

**Key Technical Controls**:
- Encryption in transit (HTTPS) ✓
- Encryption at rest (needs implementation)
- Audit logging (needs implementation)
- Access controls (needs verification)
- Incident response plan (needs creation)

**Legal Documents Needed**:
- Privacy Policy
- Terms of Service
- Data Processing Agreement
- Staff Data Handling Policy
- Incident Response Plan

**No COPPA Compliance Needed** (students 13+)  
**No Biometric Data Collection** (not in app)  
**Recommendation**: Implement audit logging and encryption before launch

---

**Status**: Research Complete — Ready for Legal Team Review  
**Prepared By**: Security Research Task  
**Date**: August 6, 2026

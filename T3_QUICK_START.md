# T3 Parent Experience — Quick Start Testing Guide

**Status:** ✅ Ready for browser testing on https://viridian.vercel.app  
**What's New:** Phase 1 (Parent Dashboard) + Phase 2 (Parent-Teacher Messaging)

---

## 🚀 Quick Test (5 minutes)

### 1. Login
- Go to: https://viridian.vercel.app
- Click "Sign In"
- Email: `parent0@example.com`
- Password: `TestPassword123!`

### 2. Navigate to Parent Home
- Should see page: "My Children"
- Click on child: "Student 1 Chen"

### 3. View Dashboard
- Should load child's learning progress
- See 5 sections: Header, Standards, Details, Resources, Calendar

### 4. Test Messaging
- Scroll to "Messages" section
- Click "View all messages →"
- Select teacher: "Teacher 1 Rodriguez"
- Type: "Hello! How is my child doing?"
- Click Send

### 5. Check Mobile (Optional)
- Open DevTools (F12)
- Set width to 375px
- Verify layout is readable

---

## 📋 Complete Testing Checklist

For thorough testing, follow: **T3_BROWSER_VERIFICATION.md**

This includes:
- ✅ 8 test phases (Auth, Header, Standards, Details, Messages, Calendar, Mobile, Jargon)
- ✅ 100+ specific test cases
- ✅ Issue reporting template
- ✅ Sign-off checklist

---

## 🎯 What to Look For

### ✅ Should Work
- [ ] Parent home page shows children list
- [ ] Clicking child loads their dashboard
- [ ] Dashboard header shows child name + grade + class + teacher
- [ ] Standards show status pills (Green/Amber/Gray)
- [ ] Clicking expand shows "What is this?", "How can I help?" tips
- [ ] Messages section shows teacher name + unread count
- [ ] Sending message works (message appears in thread)
- [ ] Mobile layout (375px) doesn't have horizontal scroll
- [ ] All text is plain English (no "standards-aligned", "proficiency", "mastery level")

### ❌ If Something Breaks
- Screenshot it
- Note the steps to reproduce
- Report to T1 (Orchestrator) with issue template from T3_BROWSER_VERIFICATION.md

---

## 🔍 Key Areas to Test

### Parent Dashboard Header
**Location:** Top of child dashboard  
**Check:** Child name, grade, class name, teacher name, teacher email

### Standards Overview
**Location:** Below header  
**Check:** 2-4 standards with status pills, mastery %, progress bars

### Expandable Details
**Location:** Click expand arrow on any standard  
**Check:** "What is this?", "What does mastery mean?", "How can I help?" sections

### Messages
**Location:** Between Standards and Calendar  
**Check:** Teacher list, unread counts, click to message, send message works

### Mobile Test
**How:** Open DevTools (F12) → Device Toolbar → 375px width  
**Check:** No horizontal scroll, text readable, buttons accessible

---

## 📞 Questions or Issues?

1. Check T3_BROWSER_VERIFICATION.md for detailed checklist
2. Check T3_PRETEST_VERIFICATION.md for what's been verified
3. Report issues with screenshots to T1

---

## 🎉 Done Testing?

Fill out sign-off in T3_BROWSER_VERIFICATION.md:
- [ ] All authentication tests pass
- [ ] Dashboard header loads correctly
- [ ] Standards overview shows all sections
- [ ] Expandable details work and use plain language
- [ ] Messages section functional
- [ ] Master calendar displays
- [ ] Mobile responsive at 375px
- [ ] Zero jargon found

**Status:** ✅ PASS / ❌ FAIL  
**Date Verified:** [date]  
**Issues Found:** X  
**Ready for User Testing:** YES / NO

---

## Test Credentials Summary

```
Parent Account
├─ Email: parent0@example.com
├─ Password: TestPassword123!
├─ Parent Name: Parent 1
│
└─ Linked Children
   ├─ Student 1 Chen (American Literature, Period 3)
   └─ Student 2 Johnson (American Literature, Period 3)
       └─ Teacher: Teacher 1 Rodriguez (teacher1@riverside.edu)
```

---

**Ready?** Go to https://viridian.vercel.app and start testing!

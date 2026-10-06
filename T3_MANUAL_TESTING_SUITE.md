# T3: Manual Testing Suite
**Date**: Oct 6, 2026  
**Purpose**: Browser-based testing for real-time sync, performance, and end-to-end workflows  
**Estimated Time**: 2-3 hours

---

## Test Environment Setup

### Prerequisites
- 2 browser windows/tabs (Chrome recommended)
- DevTools open in both
- Network tab visible for latency monitoring
- Console tab visible for errors

### URLs to Test
```
Window 1: http://localhost:3000/polymath/communities/boston-directors/discussions/disc-123
Window 2: http://localhost:3000/polymath/communities/boston-directors/discussions/disc-123
```

---

## TEST SUITE 1: Real-Time Message Sync

### Test 1.1: Message Instant Delivery

**Objective**: Message posted in Window 1 appears in Window 2 within 500ms

**Steps**:
1. Open same discussion in both windows
2. In DevTools → Console → paste:
   ```javascript
   window.messageTestStart = Date.now();
   console.log('Test start:', window.messageTestStart);
   ```
3. Window 1: Type message "TEST-001" and send
4. Window 2: DevTools → Console → paste:
   ```javascript
   const latency = Date.now() - window.messageTestStart;
   console.log('Message latency:', latency, 'ms');
   ```
5. Verify message appears and latency < 500ms

**Expected**: ✅ Message appears within 500ms  
**Pass Criteria**: Latency < 500ms, message visible in both windows

**Log Results**:
```
Test Run: TEST-001
Latency: ___ ms
Window 1 saw message at: ___ (time)
Window 2 saw message at: ___ (time)
Status: [ ] PASS [ ] FAIL
```

---

### Test 1.2: Multiple Rapid Messages

**Objective**: Send 5 messages rapidly, all arrive in order

**Steps**:
1. Window 1: Send 5 messages rapidly (< 5 seconds apart)
   ```
   Message 1
   Message 2
   Message 3
   Message 4
   Message 5
   ```
2. Window 2: Verify all 5 appear in order
3. Check message order and timestamps

**Expected**: ✅ All 5 messages appear in correct order  
**Pass Criteria**: No missing messages, correct order

**Log Results**:
```
Test Run: Multiple Messages
Messages sent: 5
Messages received: ___
Order correct: [ ] YES [ ] NO
Status: [ ] PASS [ ] FAIL
```

---

### Test 1.3: Message Update Real-Time

**Objective**: Edit message in one window, see update in other

**Steps**:
1. Window 1: Post message "Original text"
2. Window 1: Edit message to "Updated text"
3. Window 2: Verify updated text appears

**Expected**: ✅ Updated text appears instantly  
**Pass Criteria**: Edit appears within 500ms

**Log Results**:
```
Test Run: Message Edit
Original: "___"
Updated: "___"
Update latency: ___ ms
Status: [ ] PASS [ ] FAIL
```

---

### Test 1.4: Message Deletion

**Objective**: Delete message in one window, disappears in other

**Steps**:
1. Window 1: Post message "DELETE-ME"
2. Window 1: Delete message
3. Window 2: Verify message disappears

**Expected**: ✅ Message removed instantly  
**Pass Criteria**: Disappears within 500ms

**Log Results**:
```
Test Run: Message Delete
Message deleted at: ___
Disappeared from other window: [ ] YES [ ] NO
Latency: ___ ms
Status: [ ] PASS [ ] FAIL
```

---

## TEST SUITE 2: Real-Time Discussion Updates

### Test 2.1: New Discussion Appears

**Objective**: Create discussion, appears instantly in other window

**Steps**:
1. Both windows: Open community view with discussions list
2. Window 1: Create new discussion "Test Discussion"
3. Window 2: Verify new discussion appears at top of list

**Expected**: ✅ New discussion appears within 500ms  
**Pass Criteria**: Discussion visible in both windows

**Log Results**:
```
Test Run: New Discussion
Discussion title: "___"
Appeared in Window 2: [ ] YES [ ] NO
Latency: ___ ms
Position: [ ] TOP [ ] BOTTOM [ ] MISSING
Status: [ ] PASS [ ] FAIL
```

---

### Test 2.2: Discussion Count Update

**Objective**: Member count updates when member joins

**Steps**:
1. Both windows: View community dashboard
2. Record member count from RealtimeMemberCount component
3. Window 1: Join community (if not already member)
4. Window 2: Check member count increased

**Expected**: ✅ Member count incremented  
**Pass Criteria**: Count increases within 300ms

**Log Results**:
```
Test Run: Member Join
Initial count: ___
After join: ___
Increment: [ ] YES [ ] NO
Status: [ ] PASS [ ] FAIL
```

---

## TEST SUITE 3: Performance Testing

### Test 3.1: Message Latency Benchmark

**Objective**: Measure typical message delivery latency

**Steps**:
1. Window 1: Open DevTools → Console
2. Paste latency test script:
   ```javascript
   const results = [];
   for (let i = 0; i < 10; i++) {
     const start = Date.now();
     // Send message programmatically
     const latency = Date.now() - start;
     results.push(latency);
   }
   console.log('Latencies:', results);
   console.log('Avg:', results.reduce((a,b)=>a+b)/results.length);
   console.log('Min:', Math.min(...results));
   console.log('Max:', Math.max(...results));
   ```
3. Record results

**Expected**: ✅ Average < 200ms  
**Pass Criteria**: P95 < 500ms, P99 < 1000ms

**Log Results**:
```
Test Run: Message Latency Benchmark
Messages: 10
Average: ___ ms
Min: ___ ms
Max: ___ ms
P95: ___ ms
P99: ___ ms
Status: [ ] PASS [ ] FAIL
```

---

### Test 3.2: Memory Usage

**Objective**: Verify no memory leaks with subscriptions

**Steps**:
1. DevTools → Memory → Take heap snapshot (initial)
2. Load discussion (100+ messages)
3. Navigate to different discussion (triggers unsubscribe)
4. Take heap snapshot (after)
5. Compare sizes

**Expected**: ✅ Memory returned (no significant increase)  
**Pass Criteria**: < 10MB increase, garbage collection visible

**Log Results**:
```
Test Run: Memory Leak Check
Initial heap: ___ MB
After load: ___ MB
After navigation: ___ MB
Difference: ___ MB
Status: [ ] PASS (< 10MB) [ ] FAIL (> 10MB)
```

---

### Test 3.3: Scroll Performance

**Objective**: Verify smooth scrolling with 100+ messages

**Steps**:
1. DevTools → Performance → Start recording
2. Open discussion with 100+ messages
3. Scroll up/down fast (10+ times)
4. Stop recording
5. Check FPS (should be 60fps)

**Expected**: ✅ Smooth 60fps scrolling  
**Pass Criteria**: Dropped frames < 10%

**Log Results**:
```
Test Run: Scroll Performance
FPS average: ___
Dropped frames: ___% (should be < 10%)
Smooth: [ ] YES [ ] NO
Status: [ ] PASS [ ] FAIL
```

---

## TEST SUITE 4: Error Handling

### Test 4.1: Network Offline

**Objective**: App handles offline gracefully

**Steps**:
1. DevTools → Network → Offline (checkbox)
2. Try to post message
3. Observe error handling
4. Go back online
5. Verify recovery

**Expected**: ✅ Error shown, message queued or error displayed  
**Pass Criteria**: No console errors, graceful error UI

**Log Results**:
```
Test Run: Offline Handling
Error shown: [ ] YES [ ] NO
Message: "___"
Recovery after online: [ ] YES [ ] NO
Status: [ ] PASS [ ] FAIL
```

---

### Test 4.2: Permission Denied (403)

**Objective**: Handle permission errors gracefully

**Steps**:
1. Try to post in discussion user doesn't have access to
2. Observe error handling
3. Check error message

**Expected**: ✅ User-friendly error message  
**Pass Criteria**: Error shown, no console errors

**Log Results**:
```
Test Run: Permission Error
Error shown: [ ] YES [ ] NO
Message: "___"
Console errors: [ ] NONE [ ] SOME
Status: [ ] PASS [ ] FAIL
```

---

### Test 4.3: Resource Not Found (404)

**Objective**: Handle missing resource gracefully

**Steps**:
1. Navigate to non-existent discussion ID
2. Observe error handling
3. Check fallback UI

**Expected**: ✅ Error message, not crash  
**Pass Criteria**: Graceful error state

**Log Results**:
```
Test Run: Not Found Error
Error shown: [ ] YES [ ] NO
Message: "___"
Navigation possible: [ ] YES [ ] NO
Status: [ ] PASS [ ] FAIL
```

---

## TEST SUITE 5: Browser Compatibility

### Test 5.1: Chrome/Edge

**Objective**: Verify works in Chrome/Edge

**Steps**:
1. Open in Chrome
2. Run all above tests
3. Note any issues

**Expected**: ✅ All tests pass

**Log Results**:
```
Browser: Chrome ___
Tests passed: __/20
Status: [ ] PASS [ ] FAIL
Issues: ___________
```

---

### Test 5.2: Firefox

**Objective**: Verify works in Firefox

**Steps**:
1. Open in Firefox
2. Run subset of tests (1.1, 2.1, 4.1)
3. Note any issues

**Expected**: ✅ Core tests pass

**Log Results**:
```
Browser: Firefox ___
Tests passed: __/3
Status: [ ] PASS [ ] FAIL
Issues: ___________
```

---

### Test 5.3: Safari

**Objective**: Verify works in Safari

**Steps**:
1. Open in Safari
2. Run subset of tests (1.1, 2.1, 4.1)
3. Note any issues

**Expected**: ✅ Core tests pass

**Log Results**:
```
Browser: Safari ___
Tests passed: __/3
Status: [ ] PASS [ ] FAIL
Issues: ___________
```

---

## TEST SUITE 6: Edge Cases

### Test 6.1: Rapid Subscribe/Unsubscribe

**Objective**: No leaks from rapid navigation

**Steps**:
1. Rapidly click between discussions (5+ times)
2. Monitor memory in DevTools
3. Check for console errors

**Expected**: ✅ Subscriptions properly cleaned up  
**Pass Criteria**: No memory growth, no errors

**Log Results**:
```
Test Run: Rapid Navigation
Actions: 5 navigations
Memory leak: [ ] NO [ ] YES
Errors: [ ] NONE [ ] SOME
Status: [ ] PASS [ ] FAIL
```

---

### Test 6.2: Large Message (>1MB)

**Objective**: Handle large messages without breaking

**Steps**:
1. Create large message (copy 10x of Lorem Ipsum)
2. Send message
3. Verify appears in other window

**Expected**: ✅ Large message handled  
**Pass Criteria**: No UI lag, appears within 1s

**Log Results**:
```
Test Run: Large Message
Message size: ___ KB
Appeared: [ ] YES [ ] NO
Latency: ___ ms
Status: [ ] PASS [ ] FAIL
```

---

### Test 6.3: Concurrent Edits

**Objective**: Handle simultaneous edits by multiple users

**Steps**:
1. Window 1: Edit message
2. Window 2: Simultaneously edit same message
3. Verify final state consistent

**Expected**: ✅ Consistent final state  
**Pass Criteria**: No conflicts, both edits respected

**Log Results**:
```
Test Run: Concurrent Edits
Final state: "___"
Status: [ ] PASS [ ] FAIL (conflicts)
```

---

## SUMMARY SCORECARD

```
TEST SUITE              PASS  FAIL  TOTAL
────────────────────────────────────────
1. Message Sync         __/4   __     4
2. Discussions          __/2   __     2
3. Performance          __/3   __     3
4. Error Handling       __/3   __     3
5. Browser Compat       __/3   __     3
6. Edge Cases           __/3   __     3
────────────────────────────────────────
TOTAL                   __/18  __    18
```

---

## Pass Criteria

**Green Light (Ready for Production)**:
- ✅ All 18 tests pass
- ✅ No console errors
- ✅ Latency consistently < 500ms
- ✅ Memory stable (no leaks)
- ✅ Works in Chrome, Firefox, Safari

**Yellow Light (Minor Issues)**:
- ⚠️ 15+ tests pass
- ⚠️ Minor console warnings (not errors)
- ⚠️ Some latency > 500ms (but < 1s)
- ⚠️ Small memory variations

**Red Light (Not Ready)**:
- ❌ < 15 tests pass
- ❌ Console errors present
- ❌ Consistent latency > 1s
- ❌ Memory leaks detected

---

## Running Full Test Suite

```bash
# Estimated time: 2-3 hours
# Manual browser testing only

# For each test:
# 1. Read "Steps"
# 2. Execute in browser
# 3. Log results in "Log Results" section
# 4. Mark [PASS] or [FAIL]

# Final: Update SUMMARY SCORECARD
# Submit results to team
```

---

## Next Steps

After completing manual tests:
1. Document any issues found
2. File bugs for failed tests
3. Proceed to deployment checklist
4. Deploy to staging/production
5. Monitor in production

**Good luck! 🧪**

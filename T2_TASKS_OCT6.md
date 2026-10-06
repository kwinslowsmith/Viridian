# T2 Frontend - Component Library Build (Oct 6)

**Your Mission**: Build a complete, polished component library while backend is being fixed tonight.

**Timeline**: 4-6 hours today → Integration testing tomorrow

---

## Quick Start

1. Open `/app/polymath/components/` directory
2. Review existing components (many exist already, refine them)
3. Follow the Priority 1, 2, 3 checklist below
4. Test all components at breakpoints: 375px (mobile), 768px (tablet), 1200px (desktop)

---

## Priority 1: REFINE EXISTING COMPONENTS (Critical Path)

### Communities List
- [ ] File: `components/CommunitiesList.tsx`
- [ ] Add loading skeleton (shimmer effect)
- [ ] Add empty state card ("No communities yet")
- [ ] Add error state display
- [ ] Test grid responsiveness: 1-col (mobile) → 2-col (tablet) → 3-col (desktop)

### Community Detail  
- [ ] File: `components/CommunityDetail.tsx`
- [ ] Add hero image section with gradient overlay
- [ ] Add member count badge with animation
- [ ] Add member avatars (stack: first 3 avatars shown)
- [ ] Add "Join" button and "Share" button with hover states
- [ ] Add tab navigation: Overview, Discussions, Resources, Members

### Discussion Thread
- [ ] File: `components/DiscussionThread.tsx`
- [ ] Add message input form at bottom (don't wire API yet)
- [ ] Add edit/delete menu on message hover
- [ ] Add timestamps ("2 min ago", "Oct 5 at 2:30 PM")
- [ ] Add user avatars next to each message
- [ ] Test scroll performance with 100+ messages

---

## Priority 2: BUILD NEW FORM COMPONENTS

Create these files in `/app/polymath/components/forms/`:

### CreateDiscussionForm.tsx
```
Fields:
- Title input (required, placeholder "Discussion title")
- Description textarea (optional, rich text support or just plain text)
- Submit button (loading state)
- Cancel button

Validation:
- Title required, min 5 chars, max 100 chars
- Show red error text if invalid
- Disable submit until valid
```

### CreateMessageForm.tsx
```
Fields:
- Text input (required, placeholder "Write a message...")
- Send button (keyboard shortcut: Ctrl+Enter)
- Optional: emoji picker button

Features:
- Auto-grow textarea (resize as user types)
- Loading state on send button
- Success animation (checkmark flash, then clear input)
```

### ScheduleMeetingForm.tsx
```
Fields:
- Title input (required)
- Date picker (no past dates)
- Time picker (HH:MM format)
- Zoom URL input (optional, validate URL)
- Location input (optional)
- Description textarea (optional)
- Submit button

Validation:
- All required fields validated
- URL must start with https://zoom.us or valid domain
- Time must be in future
- Show validation errors in red
```

---

## Priority 3: DESIGN SYSTEM POLISH

### Button Styles
- [ ] Primary (solid blue, white text, hover darker)
- [ ] Secondary (outline blue, blue text, hover fill)
- [ ] Danger (solid red, white text, hover darker)
- [ ] Disabled (gray, opacity 50%, no cursor)
- [ ] Loading state (spinner on button)

### Form Inputs
- [ ] Default state (light gray border)
- [ ] Focus state (blue border, shadow)
- [ ] Error state (red border, error icon)
- [ ] Disabled state (gray bg, no pointer)
- [ ] Loading state (spinner inside input)

### Color Palette
Verify these are used consistently:
- [ ] Primary blue: `#3b82f6`
- [ ] Success green: `#10b981`
- [ ] Error red: `#ef4444`
- [ ] Warning orange: `#f59e0b`
- [ ] Text dark: `#1f2937`
- [ ] Text light: `#6b7280`
- [ ] Border: `#e5e7eb`
- [ ] Background: `#f9fafb`

### Spacing
- [ ] 4px, 8px, 16px, 24px, 32px
- [ ] Margins/padding consistent
- [ ] Gap between items consistent

---

## Testing Checklist

**Manual Testing**:
- [ ] Test at 375px width (mobile) - single column, large touch targets
- [ ] Test at 768px width (tablet) - 2 columns where applicable
- [ ] Test at 1200px width (desktop) - full multi-column layout
- [ ] Test all forms with invalid input (show error states)
- [ ] Test all forms with valid input (show success states)
- [ ] Test loading states (use setTimeout to simulate delay)

**Browser Testing**:
- [ ] Chrome/Edge (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Mobile Safari (iOS 15+)
- [ ] Chrome Mobile (Android 12+)

---

## Files to Touch

```
app/polymath/components/
  ├── CommunitiesList.tsx (refine)
  ├── CommunityDetail.tsx (refine)
  ├── DiscussionThread.tsx (refine)
  ├── forms/
  │   ├── CreateDiscussionForm.tsx (new)
  │   ├── CreateMessageForm.tsx (new)
  │   └── ScheduleMeetingForm.tsx (new)
  ├── UI/
  │   ├── Button.tsx (verify all variants)
  │   ├── Input.tsx (verify all states)
  │   ├── Card.tsx (ensure consistent styling)
  │   └── Badge.tsx (for status indicators)
```

---

## Success Criteria

✅ All components render without errors  
✅ All forms show validation errors correctly  
✅ All components responsive at 3+ breakpoints  
✅ No console errors or warnings  
✅ Components work with mock data (no API calls yet)  
✅ Ready for API integration tomorrow  

---

## Tomorrow (Oct 7)

Wire these components to real API endpoints:
- CommunitiesList → GET /api/communities
- CommunityDetail → GET /api/communities/[slug]
- DiscussionThread → GET messages, POST new message
- Forms → POST endpoints

**Let's ship this! 🚀**

# T3 Integration - Real-Time Hooks & API Layer (Oct 6)

**Your Mission**: Build real-time infrastructure and API integration layer while backend is being fixed tonight.

**Timeline**: 4-6 hours today → Integration testing tomorrow

---

## Quick Start

1. Open `/app/polymath/hooks/` directory (create if doesn't exist)
2. Open `/app/polymath/lib/` directory (create if doesn't exist)
3. Build custom React hooks for Supabase subscriptions
4. Create API client layer for type-safe API calls
5. Write unit tests using Jest + React Testing Library

---

## Priority 1: BUILD REAL-TIME HOOKS (Critical Path)

### useMessages Hook
**File**: `hooks/useMessages.ts`

```typescript
export function useMessages(communityId: string, discussionId: string) {
  // Subscribe to Supabase messages table
  // Filter by communityId AND discussionId
  // Auto-unsubscribe on unmount
  // Return: { messages, loading, error, addMessage, deleteMessage }
  
  return {
    messages: [],
    loading: false,
    error: null,
    addMessage: async (text: string) => {},
    deleteMessage: async (messageId: string) => {},
  };
}
```

**Test Cases**:
- [ ] Subscribe to messages, unsubscribe on unmount
- [ ] New message appears instantly (test with 2 open windows)
- [ ] Message updates appear instantly
- [ ] No memory leaks (verify subscriptions cleaned up)
- [ ] Error handling (network down, auth failed)

### useDiscussions Hook
**File**: `hooks/useDiscussions.ts`

```typescript
export function useDiscussions(communityId: string) {
  // Subscribe to Supabase discussions table
  // Filter by communityId
  // Auto-unsubscribe on unmount
  // Return: { discussions, loading, error, addDiscussion, updateDiscussion, deleteDiscussion }
  
  return {
    discussions: [],
    loading: false,
    error: null,
    addDiscussion: async (title: string, description?: string) => {},
    updateDiscussion: async (id: string, updates: {}) => {},
    deleteDiscussion: async (id: string) => {},
  };
}
```

**Test Cases**:
- [ ] Subscribe to discussions, unsubscribe on unmount
- [ ] New discussion appears instantly (test with 2 windows)
- [ ] Discussions update instantly
- [ ] Sorting works (by date, by activity)
- [ ] Error handling

### useCommunityMembers Hook
**File**: `hooks/useCommunityMembers.ts`

```typescript
export function useCommunityMembers(communityId: string) {
  // Subscribe to LearningCommunityMember table
  // Filter by communityId
  // Auto-unsubscribe on unmount
  // Return: { members, count, loading, error }
  
  return {
    members: [],
    count: 0,
    loading: false,
    error: null,
  };
}
```

**Test Cases**:
- [ ] Subscribe to members, unsubscribe on unmount
- [ ] New member count updates instantly
- [ ] Member list updates instantly
- [ ] Error handling

### useAuthenticatedUser Hook
**File**: `hooks/useAuthenticatedUser.ts`

```typescript
export function useAuthenticatedUser() {
  // Get current user from NextAuth session
  // Return: { user, isLoading, isAuthenticated, logout }
  
  return {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    logout: async () => {},
  };
}
```

**Test Cases**:
- [ ] Returns user from session
- [ ] Returns null if not authenticated
- [ ] logout() clears session

---

## Priority 2: BUILD API INTEGRATION LAYER

### useFetch Hook
**File**: `hooks/useFetch.ts`

Generic wrapper for all API calls:

```typescript
interface UseFetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

export function useFetch<T>(url: string, options?: UseFetchOptions) {
  // Fetch data, handle auth, manage loading/error states
  // Return: { data, loading, error, refetch }
  
  return {
    data: null as T | null,
    loading: false,
    error: null as Error | null,
    refetch: async () => {},
  };
}

// Usage:
// const { data: communities, loading, error } = useFetch('/api/communities');
```

**Features**:
- [ ] Auto-include auth token in headers (from NextAuth session)
- [ ] Auto-convert JSON responses
- [ ] Auto-handle error responses (4xx, 5xx)
- [ ] Loading state management
- [ ] Refetch capability
- [ ] Abort on unmount (prevent memory leaks)

**Test Cases**:
- [ ] GET request works
- [ ] POST request works with body
- [ ] Auth headers included
- [ ] Error responses handled
- [ ] Loading state works
- [ ] Refetch works

### API Client Service (Optional)
**File**: `lib/api.ts`

Centralized API client:

```typescript
export const api = {
  communities: {
    list: () => useFetch('/api/communities'),
    get: (slug: string) => useFetch(`/api/communities/${slug}`),
    create: (data: any) => useFetch('/api/communities', { method: 'POST', body: data }),
  },
  discussions: {
    list: (slug: string) => useFetch(`/api/communities/${slug}/discussions`),
    create: (slug: string, data: any) => useFetch(...),
    get: (slug: string, id: string) => useFetch(...),
    update: (slug: string, id: string, data: any) => useFetch(...),
    delete: (slug: string, id: string) => useFetch(...),
  },
  // ... etc for messages, meetings, stats
};
```

**Benefits**:
- Type-safe API calls
- Consistent error handling
- Easy to refactor later

---

## Priority 3: ERROR HANDLING & TEST SUITE

### ErrorBoundary Component
**File**: `components/ErrorBoundary.tsx`

```typescript
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  // Catch component errors
  // Show error UI
  // Provide retry button
}
```

**Test Cases**:
- [ ] Catches component errors
- [ ] Shows error message
- [ ] Retry button works

### Setup Jest & React Testing Library
**File**: `jest.config.js` (if doesn't exist)

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
```

**File**: `jest.setup.js`

```javascript
import '@testing-library/jest-dom';
// Mock fetch
global.fetch = jest.fn();
// Mock Supabase
jest.mock('@supabase/supabase-js');
```

### Unit Tests for Hooks
**File**: `hooks/__tests__/useMessages.test.ts`

```typescript
describe('useMessages', () => {
  it('subscribes to messages on mount', () => {});
  it('unsubscribes on unmount', () => {});
  it('adds message to list', () => {});
  it('deletes message from list', () => {});
  it('handles errors', () => {});
});
```

Repeat for: `useDiscussions`, `useCommunityMembers`, `useAuthenticatedUser`, `useFetch`

### Component Tests
**File**: `components/__tests__/CommunitiesList.test.tsx`

```typescript
describe('CommunitiesList', () => {
  it('renders with mock data', () => {});
  it('shows loading state', () => {});
  it('shows error state', () => {});
  it('shows empty state', () => {});
});
```

---

## Files to Create

```
app/polymath/
  ├── hooks/
  │   ├── useMessages.ts (new)
  │   ├── useDiscussions.ts (new)
  │   ├── useCommunityMembers.ts (new)
  │   ├── useAuthenticatedUser.ts (new)
  │   ├── useFetch.ts (new)
  │   └── __tests__/
  │       ├── useMessages.test.ts (new)
  │       ├── useDiscussions.test.ts (new)
  │       ├── useCommunityMembers.test.ts (new)
  │       ├── useAuthenticatedUser.test.ts (new)
  │       └── useFetch.test.ts (new)
  ├── lib/
  │   ├── api.ts (optional, new)
  │   └── constants.ts (base API URL, etc)
  ├── components/
  │   ├── ErrorBoundary.tsx (new)
  │   └── __tests__/
  │       └── CommunitiesList.test.tsx (new)
  └── jest.setup.js (if new)
```

---

## Testing Strategy

**Unit Tests**:
- Test each hook independently
- Mock Supabase
- Mock fetch
- Verify subscription/unsubscription logic

**Integration Tests** (will do tomorrow):
- Test real Supabase subscriptions
- Test real API endpoints
- Test end-to-end flows

**Manual Testing**:
- Open 2 browser windows
- Subscribe to same data in both
- Make change in one window
- Verify instant update in other window

---

## Success Criteria

✅ All hooks built and unit-tested  
✅ useFetch works with mock API responses  
✅ ErrorBoundary catches component errors  
✅ No console errors or warnings  
✅ 100% subscription cleanup (no memory leaks)  
✅ All tests pass  
✅ Ready for backend integration tomorrow  

---

## Tomorrow (Oct 7)

- Replace mock data with real API calls
- Test real Supabase subscriptions
- Test real-time sync across windows
- Create integration test suite

**Let's build this! 🚀**

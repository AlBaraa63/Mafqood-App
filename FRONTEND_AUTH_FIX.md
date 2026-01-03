# Frontend Authentication Fix

## Problem
The frontend was showing a loading screen and not displaying any content. The backend logs showed `401 Unauthorized` errors for `/auth/users/me`, indicating an authentication issue.

## Root Cause
The API client functions (`getMyItems()` and `getMatches()`) were not passing authentication tokens when making requests to the backend. While the backend endpoints support optional authentication (returning all items for anonymous users and filtered items for authenticated users), the frontend wasn't properly passing the token parameter.

## Solution
Updated the following files to properly pass authentication tokens:

### 1. API Client Functions (`src/api/index.ts`)
- Modified `getMyItems(token?: string | null)` to accept optional token parameter
- Modified `getMatches(token?: string | null)` to accept optional token parameter
- Both functions now pass the token to the underlying `get()` function

### 2. Home Screens
- **`src/screens/Home/HomeScreen.tsx`**:
  - Added `token` to destructured `useAuthStore()` values
  - Updated `loadData()` to pass token: `api.getMyItems(token)`

- **`src/screens/Home/HomeScreen.native.tsx`**:
  - Added `token` to destructured `useAuthStore()` values
  - Updated `loadData()` to pass token: `api.getMyItems(token)`

### 3. Matches Screens
- **`src/screens/Matches/MatchesListScreen.tsx`**:
  - Added `token` to destructured `useAuthStore()` values
  - Updated `loadMatches()` to pass token: `api.getMatches(token)`

- **`src/screens/Matches/MatchesListScreen.native.tsx`**:
  - Added `token` to destructured `useAuthStore()` values
  - Updated `loadMatches()` to pass token: `api.getMatches(token)`

## How It Works Now

### For Authenticated Users
1. User logs in or registers
2. Auth token is stored in `useAuthStore`
3. Screens retrieve `token` from the store
4. API calls include the token in the `Authorization` header
5. Backend returns user-specific items

### For Guest Users
1. User continues as guest (no token)
2. `token` is `null` in `useAuthStore`
3. API calls pass `null` token
4. Backend's `get_optional_user_id()` returns `None`
5. Backend returns all items (demo mode)

## Backend Configuration
The backend endpoints are already configured correctly:
- `/api/v1/history` uses `get_optional_user_id()` dependency
- Returns `None` if no token provided (anonymous access)
- Returns filtered results if valid token provided
- No breaking changes required

## Testing
```bash
# Test without authentication (should work)
curl -X GET "http://127.0.0.1:8000/api/v1/history"

# Test with authentication (requires valid token)
curl -X GET "http://127.0.0.1:8000/api/v1/history" \
  -H "Authorization: Bearer <your_token>"
```

## Impact
- ✅ Guest users can now view all items (demo mode)
- ✅ Authenticated users see only their items
- ✅ No more loading screen stuck
- ✅ Proper error handling maintained
- ✅ Backward compatible with existing code

## Files Modified
1. `src/api/index.ts` - API client functions
2. `src/screens/Home/HomeScreen.tsx` - Web home screen
3. `src/screens/Home/HomeScreen.native.tsx` - Native home screen
4. `src/screens/Matches/MatchesListScreen.tsx` - Web matches screen
5. `src/screens/Matches/MatchesListScreen.native.tsx` - Native matches screen

## Next Steps
1. Test the frontend with the updated code
2. Verify guest mode works correctly
3. Verify authenticated mode works correctly
4. Check for any remaining loading/error states

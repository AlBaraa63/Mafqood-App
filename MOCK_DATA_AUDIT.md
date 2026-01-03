# Mock Data & Hardcoded Values Audit
**Generated:** January 2, 2026  
**Project:** Mafqood App

---

## 📋 Summary

This document lists all mock data, hardcoded values, test placeholders, and demo implementations throughout the Mafqood codebase.

| Category | Count | Priority |
|----------|-------|----------|
| Mock API/Auth Data | 5 | 🔴 High |
| Hardcoded Placeholders | 12 | 🟡 Medium |
| Test/Demo Strings | 8 | 🟡 Medium |
| Mock Components | 3 | 🟢 Low |
| **Total** | **28** | - |

---

## 🔴 High Priority: Mock API & Authentication

### 1. **Backend Mock User (Auth Not Implemented)**
**File:** `backend/app/routers/items.py:447-449`
```python
MOCK_USER = {
    "id": "user-1",
    "email": "demo@mafqood.ae",
    "full_name": "Demo User",
    "phone": "+971501234567",
}

MOCK_TOKEN = "mock-jwt-token-12345"
```
**Status:** ❌ Backend auth endpoints are mock/demo only
**Issue:** Login, register, forgot-password all accept any credentials
**Location References:**
- Line 447-449: MOCK_USER definition
- Line 452: MOCK_TOKEN definition
- Line 460: `login()` - accepts any credentials, returns MOCK_TOKEN
- Line 471: `register()` - accepts any credentials, returns MOCK_TOKEN
- Line 484: `forgot_password()` - always succeeds
- Line 492: `get_current_user()` - returns MOCK_USER

**Affected Endpoints:**
- `POST /auth/login` - Line 460
- `POST /auth/register` - Line 471
- `POST /auth/logout` - Line 479
- `POST /auth/forgot-password` - Line 484
- `GET /users/me` - Line 492

**Action Items:**
- [ ] Implement real user authentication with JWT
- [ ] Add password hashing (bcrypt)
- [ ] Implement email verification
- [ ] Add refresh token mechanism
- [ ] Connect to database user table

---

### 2. **Frontend Mock User**
**File:** `src/api/mockData.ts:13-19`
```typescript
export const mockUser: User = {
  id: 'user-1',
  email: 'guest@mafqood.ae',
  fullName: 'Guest User',
  phone: '+971501234567',
  createdAt: new Date().toISOString(),
};
```
**Status:** ⚠️ Used for guest mode until backend auth is implemented
**Usage:** `src/api/index.ts` imports this for fallback
**Action Items:**
- [ ] Remove once backend auth is connected

---

### 3. **Frontend Auth Not Connected**
**File:** `src/api/index.ts:163-176`
```typescript
export async function login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
  // NOT CONNECTED - No backend auth endpoint yet
  // Placeholder for future implementation
}

export async function register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
  // NOT CONNECTED - No backend auth endpoint yet
  // Placeholder for future implementation
}
```
**Status:** ❌ These functions don't call the backend yet
**Note:** Backend mock endpoints exist but frontend API client not connected
**Action Items:**
- [ ] Implement login API call to `/auth/login`
- [ ] Implement register API call to `/auth/register`
- [ ] Add token storage in AsyncStorage
- [ ] Implement logout properly

---

## 🟡 Medium Priority: Hardcoded Placeholders & Sample Data

### 4. **Profile Screen Hardcoded Stats**
**File:** `src/screens/Profile/ProfileScreen.native.tsx:419-425`
```typescript
const userStats = useMemo(() => ({
  reports: 12,
  matches: 8,
  successRate: 67,
  memberSince: '2024',
}), []);
```
**Status:** 🔴 Hardcoded mock data displayed in UI
**Impact:** Users see fake stats on profile
**Action Items:**
- [ ] Connect to backend API for user stats endpoint
- [ ] Add GET `/users/me/stats` endpoint
- [ ] Cache stats in Zustand store
- [ ] Refresh stats on pull-to-refresh

---

### 5. **Profile Menu Items - Placeholder Alerts**
**File:** `src/screens/Profile/ProfileScreen.native.tsx:503-508` and `516-520`
```typescript
{
  id: 'notifications',
  onPress: () => {
    haptics.light();
    Alert.alert(t('notifications') || 'Notifications', 'Notification settings coming soon');
    //                                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  },
}

{
  id: 'help',
  onPress: () => {
    haptics.light();
    Alert.alert(t('help_support') || 'Help & Support', 'Support options coming soon');
    //                                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  },
}
```
**Status:** ⚠️ "Coming soon" placeholders in UI
**Impact:** User experience shows incomplete features
**Action Items:**
- [ ] Implement Notifications settings screen
- [ ] Implement Help & Support screen/FAQ
- [ ] Add proper navigation or remove menu items

---

### 6. **Register Screen Example Placeholders**
**File:** `src/screens/Auth/RegisterScreen.native.tsx:245-267`
```typescript
<EnhancedInput
  label={t('full_name')}
  placeholder="Ahmed Al Maktoum"
  value={fullName}
  onChangeText={(text) => {
    setFullName(text);
    clearError('fullName');
  }}
/>

<EnhancedInput
  label={t('email')}
  placeholder="email@example.com"
  value={email}
/>

<EnhancedInput
  label={t('phone_number')}
  placeholder="+971 50 123 4567"
  value={phone}
/>
```
**Status:** ✅ These are example placeholders (acceptable)
**Note:** Helps users understand format
**Note:** For translation, these should use i18n placeholders

---

### 7. **Location Detail Placeholders**
**File:** `src/i18n/strings.ts:193 & 497`
```typescript
location_area_placeholder: 'e.g., Dubai Mall, Dubai Marina, JBR'
location_detail_placeholder: 'e.g., Near the fountain, Ground floor, Parking lot B2'
```
**Status:** ✅ Good example placeholders for user guidance

---

## 🟢 Low Priority: Mock Components & Empty States

### 8. **Notifications Screen - Empty State with Mock Data**
**File:** `src/screens/Notifications/NotificationsScreen.native.tsx:258-276`
```typescript
const loadNotifications = useCallback(async () => {
  try {
    // Mock data for demonstration
    setTimeout(() => {
      setNotifications([]);  // Always returns empty
      setIsLoading(false);
      setIsRefreshing(false);
    }, 500);
  } catch (error) {
    console.error('Error loading notifications:', error);
    setIsLoading(false);
    setIsRefreshing(false);
  }
}, []);
```
**Status:** ⚠️ Always returns empty notifications array
**Impact:** Notifications screen shows empty state only
**Action Items:**
- [ ] Connect to backend notifications endpoint
- [ ] Implement real-time notifications (WebSocket or polling)
- [ ] Store notifications in backend database

---

## 📝 Reference: Standard Hardcoded Values (Acceptable)

These are standard configurations and don't need to be changed:

### Theme Colors (in `src/screens/Profile/ProfileScreen.native.tsx`)
```typescript
const colors = {
  primary: { 50: '#E0F2F7', 100: '#B3D9E8', 500: '#0B5FA8', 600: '#094E8A' },
  accent: { 50: '#FEF8F0', 600: '#B8905A', 700: '#9C7B40' },
  // ... (defined inline due to import issue)
}
```
**Status:** ✅ OK - These are theme definitions
**Note:** Should ideally import from `src/theme/index.ts` instead

---

### Layout/Spacing Constants (in Screens)
```typescript
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';
```
**Status:** ✅ OK - Runtime values, not hardcoded

---

### API Endpoints Configuration
**File:** `src/api/config.ts`
```typescript
const API_ENDPOINTS = {
  // Login & Auth
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  // ... etc
}
```
**Status:** ✅ OK - Centralized configuration

---

### Translation Strings
**File:** `src/i18n/strings.ts`
```typescript
const en = {
  app_name: 'Mafqood',
  guest_mode_limited: 'Sign in to access all features',
  // ... etc
}
```
**Status:** ✅ OK - These are translation strings

---

## 🔧 Test Data (for Backend Tests)

### Test Image Generation
**File:** `backend/tests/conftest.py:120-132`
```python
@pytest.fixture
def sample_image_bytes() -> bytes:
    """Create a simple test image (1x1 red pixel PNG)."""
    from PIL import Image
    import io
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes.read()
```
**Status:** ✅ OK - This is test data for pytest

---

### Backend Test Files
**Files:**
- `backend/tests/test_health.py` - Health check tests
- `backend/tests/test_report_found_and_lost.py` - Item upload tests
- `backend/tests/conftest.py` - Test fixtures

**Status:** ✅ OK - These are test files and should have mock data

---

## 📊 Priority Action Items

### 🔴 Critical (Must Fix Before Production)
1. **Implement real authentication backend**
   - Replace MOCK_TOKEN in `backend/app/routers/items.py:452`
   - Connect frontend `login()` to `/auth/login` endpoint
   - Connect frontend `register()` to `/auth/register` endpoint
   - Add JWT token validation

2. **Connect user stats API**
   - Replace hardcoded stats in `ProfileScreen.native.tsx:419-425`
   - Create backend endpoint `GET /users/me/stats`
   - Cache in Zustand store

### 🟡 Important (Before Release)
3. **Connect notifications API**
   - Replace empty state in `NotificationsScreen.native.tsx:258-276`
   - Implement backend notifications endpoint
   - Add real-time updates

4. **Remove placeholder alerts**
   - Replace "coming soon" in Profile menu items
   - Either implement features or remove menu items

### 🟢 Nice to Have (Future)
5. **Import colors from theme instead of inline definition**
   - Update ProfileScreen to import colors properly
   - Remove duplicate color definitions

---

## 📁 Files Needing Updates

```
CRITICAL PRIORITY:
├── backend/app/routers/items.py
│   ├── Line 447-452: MOCK_USER & MOCK_TOKEN
│   ├── Line 460: login() endpoint
│   ├── Line 471: register() endpoint
│   └── Line 484-492: forgot_password() & get_current_user()
│
├── src/api/index.ts
│   ├── Line 163-176: login() & register() functions
│   └── Line 178-190: resetDatabase() function
│
├── src/screens/Profile/ProfileScreen.native.tsx
│   ├── Line 419-425: Hardcoded userStats
│   ├── Line 503-520: "coming soon" alerts
│   └── Line 37-55: Colors definition (should import)
│
└── src/screens/Notifications/NotificationsScreen.native.tsx
    └── Line 258-276: Mock notifications (always empty)
```

---

## ✅ Verification Checklist

- [ ] All MOCK_* values removed from production code
- [ ] All "coming soon" placeholders removed or implemented
- [ ] All hardcoded stats pulled from API
- [ ] All alert() calls with placeholder text removed
- [ ] Backend auth endpoints accept real credentials
- [ ] Frontend API calls connected to backend
- [ ] User data properly cached and refreshed
- [ ] No test/demo code in production builds
- [ ] All imports properly resolved (no inline color definitions)

---

## 📞 Related Documentation

- See [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md) for API connection status
- See [backend/app/routers/items.py](./backend/app/routers/items.py) for auth endpoints
- See [src/api/index.ts](./src/api/index.ts) for frontend API client

---

**Last Updated:** January 2, 2026  
**Status:** Audit Complete - 28 items identified

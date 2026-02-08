# Lokeet Web App Testing Guide

Complete guide to testing all features of the Lokeet web app.

---

## 🚀 Setup & Running

### 1. Install Dependencies
```bash
cd ps-webapp-next
npm install
```

### 2. Configure Environment
The `.env.local` file is already configured with the Railway backend:
```
NEXT_PUBLIC_API_URL=https://web-production-5630.up.railway.app/v1
```

### 3. Run Development Server
```bash
npm run dev
```

The app will be available at: `http://localhost:3000`

---

## 🧪 Testing Checklist

### Landing Page (`/`)
- [ ] Page loads correctly
- [ ] "Lokeet" logo displays
- [ ] "Log in/Sign Up" button works
- [ ] Animated typing text works
- [ ] Responsive design (mobile/tablet/desktop)

### Sign Up (`/signup`)
- [ ] Create account with email & password
- [ ] Password validation (min 8 characters)
- [ ] Password confirmation matching
- [ ] Error handling for existing users
- [ ] Redirects to dashboard after signup
- [ ] "Already have an account?" link works

### Log In (`/login`)
- [ ] Login with email & password
- [ ] Error handling for wrong credentials
- [ ] Redirects to dashboard after login
- [ ] "Don't have an account?" link works
- [ ] Session persists (refresh page stays logged in)

### Dashboard (`/dashboard`)
- [ ] Loads after authentication
- [ ] Shows user saves count
- [ ] Displays saves in cards
- [ ] Category filtering works
- [ ] Sort by date/category works
- [ ] "New Save" button opens modal
- [ ] Can delete saves (with confirmation)
- [ ] Category cards show correct counts
- [ ] "Share" button per category works
- [ ] Profile link in header works
- [ ] Logout button works

### New Save Modal
- [ ] Modal opens/closes correctly
- [ ] Platform selector (Instagram/TikTok)
- [ ] URL field validates
- [ ] Content textarea
- [ ] Author field
- [ ] Category field (optional)
- [ ] Save button creates new save
- [ ] New save appears in dashboard
- [ ] AI processing happens (event_name extracted)
- [ ] Cancel button works

### User Profile (`/@username`)
- [ ] Loads user's profile page
- [ ] Shows profile picture placeholder
- [ ] Displays username, display name
- [ ] Shows location (zip code) if set
- [ ] Shows stats (saves count, categories count)
- [ ] Displays all user's saves in grid
- [ ] Save cards show images (if available)
- [ ] Save cards link to original posts
- [ ] "Edit Profile" button (own profile only)

### Edit Profile (on `/@username`)
- [ ] Form loads with current data
- [ ] Display name editable
- [ ] Username editable (@ prefix)
- [ ] Username validation (lowercase, alphanumeric)
- [ ] Username availability check
- [ ] Zip code editable
- [ ] Birthday editable (date picker)
- [ ] "Save" button updates profile
- [ ] "Cancel" button exits edit mode
- [ ] Changes reflect immediately
- [ ] URL updates to new username

### Share Functionality
- [ ] Share button copies link
- [ ] Share link format: `https://yourapp.com/share/{id}`
- [ ] Shared page shows category name
- [ ] Shared page shows all items
- [ ] Share page is publicly accessible (no login)
- [ ] View counter increments
- [ ] Items display correctly

---

## 🎯 User Flows to Test

### Complete New User Journey
1. Visit landing page
2. Click "Log in/Sign Up"
3. Click "Sign Up"
4. Create account with email/password
5. Auto-redirect to dashboard (empty state)
6. Click profile link (no username set yet)
7. Click "Edit Profile"
8. Set username, display name, zip code
9. Save profile
10. Visit `/@yourusername` - see profile
11. Return to dashboard
12. Click "+ New Save"
13. Fill out form and save
14. See new save in dashboard
15. Click save to view original
16. Delete save
17. Logout
18. Login again
19. Verify data persists

### Existing User Journey
1. Login with existing account
2. Dashboard shows previous saves
3. Filter by category
4. Sort by date
5. Click category "Share" button
6. Copy share link
7. Open share link in incognito window
8. Verify public access works
9. Return to dashboard
10. Update profile
11. Add more saves
12. Test all CRUD operations

### Mobile Experience
1. Test on mobile device or responsive mode
2. Verify all buttons are tappable
3. Check forms are usable
4. Verify navigation works
5. Test save cards display correctly
6. Check profile page is responsive

---

## 🔍 Specific Features to Test

### Authentication
- **Session Management**
  - [ ] Login persists after page refresh
  - [ ] Session expires correctly
  - [ ] Logout clears session
  - [ ] Protected routes redirect to login

### Dashboard Features
- **Filtering**
  - [ ] "All Categories" shows everything
  - [ ] Selecting category filters correctly
  - [ ] No results state displays

- **Sorting**
  - [ ] Sort by date (newest first)
  - [ ] Sort by category (alphabetical)

- **Categories**
  - [ ] Shows unique categories
  - [ ] Count is accurate
  - [ ] Share button works per category

### Profile Features
- **Display**
  - [ ] Profile picture (first letter avatar)
  - [ ] Username with @ symbol
  - [ ] Display name
  - [ ] Location
  - [ ] Stats (saves, categories)
  - [ ] Collections (if set)

- **Editing**
  - [ ] Username uniqueness check
  - [ ] Real-time validation
  - [ ] Error messages clear
  - [ ] Save updates database
  - [ ] Changes visible immediately

### Save Operations
- **Create**
  - [ ] All fields save correctly
  - [ ] AI extraction works
  - [ ] Images array handled
  - [ ] Default values set

- **Read**
  - [ ] All saves load
  - [ ] Pagination (if needed)
  - [ ] Images display
  - [ ] Links work

- **Update**
  - [ ] Edit functionality (TODO)
  - [ ] Category change
  - [ ] Tags update

- **Delete**
  - [ ] Confirmation modal
  - [ ] Removes from database
  - [ ] Updates UI immediately

---

## 🐛 Known Issues / TODOs

### Backend Needs
- [ ] Add public profile endpoint: `GET /v1/user/profile/{username}`
- [ ] Add share link metadata/preview
- [ ] Add pagination for saves

### Frontend Needs
- [ ] Add edit save functionality
- [ ] Add bulk operations (delete multiple)
- [ ] Add search functionality
- [ ] Add image upload
- [ ] Add collections management
- [ ] Add tags management
- [ ] Add export functionality
- [ ] Add import from extension

### UX Improvements
- [ ] Loading states for all operations
- [ ] Toast notifications for success/error
- [ ] Skeleton loaders
- [ ] Infinite scroll for saves
- [ ] Image lightbox/viewer
- [ ] Keyboard shortcuts
- [ ] Dark mode

---

## 📊 Test Data

### Sample Test Users
```javascript
{
  email: "test1@lokeet.io",
  password: "TestPassword123!",
  username: "testuser1",
  display_name: "Test User One"
}

{
  email: "test2@lokeet.io",
  password: "TestPassword123!",
  username: "catdaisy",
  display_name: "Cat Daisy"
}
```

### Sample Save Data
```javascript
{
  platform: "instagram",
  url: "https://instagram.com/p/abc123",
  content: "Amazing brunch spot in downtown! Best avocado toast and mimosas. Open Saturdays 9am-2pm.",
  author: "foodielover",
  category: "Brunch Spots"
}

{
  platform: "tiktok",
  url: "https://tiktok.com/@user/video/123",
  content: "Check out this hidden rooftop bar with stunning sunset views! 🌅",
  author: "cityadventurer",
  category: "Nightlife"
}
```

---

## 🔧 Debugging Tips

### Common Issues

**1. "Failed to fetch" errors**
- Check `.env.local` has correct API URL
- Verify Railway backend is running
- Check browser console for CORS errors

**2. Authentication not working**
- Clear localStorage: `localStorage.clear()`
- Check Supabase is configured
- Verify email confirmation disabled

**3. Saves not loading**
- Check network tab for API responses
- Verify user is authenticated
- Check database has saves

**4. Profile page 404**
- Ensure username is set in profile
- Check URL format: `/@username` not `/username`
- Verify Next.js routing is correct

### Browser DevTools
```javascript
// Check current auth state
localStorage.getItem('lokeet_session')
JSON.parse(localStorage.getItem('lokeet_user'))

// Test API directly
fetch('https://web-production-5630.up.railway.app/v1/health')
  .then(r => r.json())
  .then(console.log)
```

---

## ✅ Success Criteria

The web app is fully functional when:

1. **All authentication flows work**
   - Signup, login, logout
   - Session persistence
   - Protected routes

2. **Dashboard is operational**
   - Displays saves
   - Filtering works
   - Sorting works
   - CRUD operations succeed

3. **Profiles are functional**
   - View own profile
   - Edit profile
   - Username system works
   - Stats display correctly

4. **Sharing works**
   - Create share links
   - Public access to shares
   - Proper display of shared data

5. **Mobile responsive**
   - Works on all screen sizes
   - Touch-friendly
   - Readable text

---

## 📝 Testing Report Template

Use this template to document your testing:

```
## Test Session: [Date]

### Environment
- Browser: [Chrome/Firefox/Safari]
- Screen Size: [Desktop/Tablet/Mobile]
- Backend: [Railway URL]

### Tests Performed
1. [Feature] - [PASS/FAIL] - [Notes]
2. [Feature] - [PASS/FAIL] - [Notes]
...

### Issues Found
1. [Description] - [Severity] - [Steps to reproduce]
2. [Description] - [Severity] - [Steps to reproduce]
...

### Suggestions
- [Improvement idea 1]
- [Improvement idea 2]
...
```

---

**Happy Testing!** 🎉

For issues or questions, check the browser console and network tab first.

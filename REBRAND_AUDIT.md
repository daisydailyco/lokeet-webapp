# ParaSosh Rebrand Audit

Complete audit of naming conventions across the codebase to track rebrand from "LoopLocal" to "ParaSosh".

---

## Executive Summary

**Rebrand Status:** 🟡 **Partial - Inconsistent**

### Quick Stats
- **✅ Rebranded:** Chrome Extension (UI & functionality)
- **❌ Not Rebranded:** Web apps (ps-webapp, ps-webapp-next)
- **⚠️ Mixed:** Backend (API endpoints OK, database files still "looplocal")
- **⚠️ Mixed:** File structure (folders renamed to "ps-*", but still in "looplocal-extension" directory)

---

## 1. CHROME EXTENSION (✅ Mostly Rebranded)

### manifest.json ✅
```json
"name": "ParaSosh: Save & Share"
"default_title": "ParaSosh"
"host_permissions": ["*://parasosh.io/*"]
```

### popup.html ⚠️ Partial
```html
<!-- CORRECT -->
<div class="logo">ParaSosh</div>
<a href="https://parasosh.io/signup.html">

<!-- INCORRECT -->
<title>LoopLocal</title>  ❌ Should be "ParaSosh"
```

### popup.js ⚠️ Partial
```javascript
// CSS classes still reference "looplocal"
'looplocal-confirm-overlay'
'looplocal-confirm-modal'
'looplocal-confirm-title'
'looplocal-confirm-buttons'
'looplocal-confirm-btn'
```
**Note:** These are internal class names, not visible to users

### background.js ✅
```javascript
class ParaSoshAPI {
  // All functionality references ParaSosh
}
```

### content-scripts/ ✅
- `instagram.js`: `class InstagramParaSosh`, "Save to ParaSosh" buttons
- `tiktok.js`: `class TikTokParaSosh`, "Save to ParaSosh" buttons
- Console logs: `[ParaSosh]`

### ext-auth.js ✅
```javascript
// ParaSosh Extension Authentication Module
```

### looplocal-styles.css ❌
**Filename still:** `looplocal-styles.css`
**Should be:** `parasosh-styles.css`

**Used in manifest.json:**
```json
"css": ["looplocal-styles.css"]  // ❌ Needs update
```

---

## 2. BACKEND (⚠️ Mixed)

### ps-backend/main.py

#### Database Files ❌
```python
'looplocal.db'  # Main database
'looplocal_backup_*.db'  # Backup files
```
**Should be:** `parasosh.db`

#### API Title ✅
```python
app = FastAPI(
    title="ParaSosh AI Backend",
    description="AI-powered social media content parsing..."
)
```

#### URLs ✅
```python
BASE_URL = os.getenv("BASE_URL", "https://parasosh.io")
```

#### HTML Rendering ✅
```python
def render_shared_list_html():
    # Returns "ParaSosh - Save & Share"
    <div class="logo">ParaSosh</div>
```

### Other Backend Files
- `backup.py` ❌ - References `looplocal.db`, `looplocal_backup_*.db`
- `migrate.py` ❌ - References `looplocal.db`
- `init_db.py` ❌ - References `looplocal.db`
- `test_phase0.py` ❌ - References `looplocal.db`

---

## 3. WEB APP - LEGACY (ps-webapp/) ❌ NOT REBRANDED

### HTML Files (ALL need rebrand)

#### index.html ❌
```html
<title>LoopLocal - Save & Share Local Experiences</title>
<div class="logo">LoopLocal</div>
<meta name="apple-mobile-web-app-title" content="LoopLocal">
```

#### dashboard.html ❌
```html
<title>Dashboard - LoopLocal</title>
<div class="logo">LoopLocal</div>
```

#### share.html ❌
```html
<title>Shared List - LoopLocal</title>
<a href="/">LoopLocal</a>
<a href="https://www.looplocal.app">  <!-- Dead link -->
```

#### login.html ❌
```html
<title>Log In - LoopLocal</title>
<div class="logo">LoopLocal</div>
```

#### signup.html ❌
```html
<title>Sign Up - LoopLocal</title>
<div class="logo">LoopLocal</div>
```

### JavaScript Files

#### auth.js ❌
```javascript
const SESSION_KEY = 'looplocal_session';
const USER_KEY = 'looplocal_user';
```
**Should be:** `parasosh_session`, `parasosh_user`

#### dashboard.js ❌
```javascript
// LoopLocal Dashboard JavaScript
```

#### share.js ❌
```javascript
document.title = `${data.category} - LoopLocal`;
```

#### service-worker.js ❌
```javascript
const CACHE_NAME = 'looplocal-v7';
```

### manifest.json ❌
```json
{
  "name": "LoopLocal",
  "short_name": "LoopLocal"
}
```

---

## 4. WEB APP - NEXT.JS (ps-webapp-next/) ⚠️ Partial

Most files still reference "looplocal" in:
- `public/` folder (contains old files)
- `package.json` references
- File paths

**Note:** This app is currently just a landing page and not fully developed.

---

## 5. FILE STRUCTURE

### Current Directory Structure
```
looplocal-extension/              ❌ Main folder name
├── ps-backend/                    ✅ Renamed
│   ├── looplocal.db              ❌ Database file
│   ├── backups/
│   │   └── looplocal_backup_*.db ❌ Backup files
│   └── migrations/
├── ps-webapp/                     ✅ Renamed
├── ps-webapp-next/                ✅ Renamed
├── looplocal-styles.css          ❌ CSS file
└── looplocal-extension-v*.zip    ❌ Old zip files
```

### Recommended Structure
```
parasosh-extension/               ✅ Rename main folder
├── ps-backend/                   ✅ Keep
│   ├── parasosh.db              ✅ Rename
│   ├── backups/
│   │   └── parasosh_backup_*.db ✅ Rename
│   └── migrations/
├── ps-webapp/                    ✅ Keep
├── ps-webapp-next/               ✅ Keep
└── parasosh-styles.css          ✅ Rename
```

---

## 6. SHARE PAGE

### Backend-Generated HTML (in main.py) ✅
```html
<div class="logo">ParaSosh</div>
<div class="tagline">Save & Share</div>
```

### Frontend share.html (ps-webapp/) ❌
```html
<title>Shared List - LoopLocal</title>
<a href="/">LoopLocal</a>
```

---

## REBRAND CHECKLIST

### 🎯 High Priority (User-Facing)

#### Web App (ps-webapp/)
- [ ] `index.html` - Change all "LoopLocal" to "ParaSosh"
- [ ] `dashboard.html` - Change all "LoopLocal" to "ParaSosh"
- [ ] `login.html` - Change all "LoopLocal" to "ParaSosh"
- [ ] `signup.html` - Change all "LoopLocal" to "ParaSosh"
- [ ] `share.html` - Change all "LoopLocal" to "ParaSosh"
- [ ] `manifest.json` - Change name to "ParaSosh"
- [ ] `auth.js` - Change localStorage keys to `parasosh_session`, `parasosh_user`
- [ ] `dashboard.js` - Update header comment
- [ ] `share.js` - Update title to ParaSosh
- [ ] `service-worker.js` - Change cache name to `parasosh-v1`

#### Extension
- [ ] `popup.html` - Change `<title>` from "LoopLocal" to "ParaSosh"
- [ ] `looplocal-styles.css` - Rename to `parasosh-styles.css`
- [ ] `manifest.json` - Update CSS reference to `parasosh-styles.css`

---

### 🔧 Medium Priority (Backend/Infrastructure)

#### Database Files
- [ ] Rename `looplocal.db` to `parasosh.db`
- [ ] Update `main.py` - All database references
- [ ] Update `backup.py` - All database references
- [ ] Update `migrate.py` - All database references
- [ ] Update `init_db.py` - All database references
- [ ] Update `test_phase0.py` - All database references
- [ ] Update backup filenames: `looplocal_backup_*` → `parasosh_backup_*`

#### File Structure
- [ ] Rename main folder: `looplocal-extension` → `parasosh-extension`
- [ ] Delete old zip files: `looplocal-extension-v*.zip`

---

### 🎨 Low Priority (Internal/Non-User-Facing)

#### CSS Class Names (popup.js)
- [ ] Optional: Change `looplocal-*` class names to `parasosh-*`
- **Note:** These are internal and not visible to users

#### Code Comments
- [ ] Update any remaining code comments referencing "LoopLocal"

#### Next.js App (ps-webapp-next/)
- [ ] Clean up old files in `public/` folder
- [ ] Update when app is fully developed

---

## NAMING CONVENTIONS DECISION MATRIX

### What to Use Where

| Component | Display Name | Internal Name | File Names |
|-----------|--------------|---------------|------------|
| **Extension** | ParaSosh | ParaSosh | parasosh-* |
| **Web App** | ParaSosh | ParaSosh | parasosh-* |
| **Backend API** | ParaSosh AI Backend | ParaSosh | parasosh.db |
| **Database** | - | parasosh | parasosh.db |
| **CSS Classes** | - | parasosh- | parasosh-*.css |
| **localStorage** | - | parasosh_* | - |
| **Cache Names** | - | parasosh-v* | - |

### Consistent Naming Patterns

#### User-Facing (Always "ParaSosh")
- ✅ Page titles: "ParaSosh - Dashboard"
- ✅ Logos: "ParaSosh"
- ✅ Buttons: "Save to ParaSosh"
- ✅ Notifications: "Saved to ParaSosh!"
- ✅ Links: parasosh.io

#### Internal (Use "parasosh_" or "parasosh-")
- ✅ localStorage keys: `parasosh_session`, `parasosh_user`
- ✅ CSS classes: `parasosh-modal`, `parasosh-button`
- ✅ Cache names: `parasosh-v1`
- ✅ Database files: `parasosh.db`
- ✅ File names: `parasosh-styles.css`

#### Code (PascalCase/camelCase)
- ✅ Classes: `ParaSoshAPI`, `InstagramParaSosh`
- ✅ Variables: `paraSoshSession`, `paraSoshData`

---

## MIGRATION STRATEGY

### Phase 1: Web App Rebrand (Highest Impact) 🔥
**Time:** 1-2 hours
**Impact:** High - All web users see this
**Files:** 10 files in `ps-webapp/`

1. Update all HTML titles and logos
2. Update JavaScript localStorage keys
3. Update manifest.json
4. Test all pages work correctly
5. Deploy to parasosh.io

### Phase 2: Extension Polish (Medium Impact) 🎨
**Time:** 30 minutes
**Impact:** Medium - Extension users see title
**Files:** 3 files

1. Update popup.html title
2. Rename looplocal-styles.css
3. Update manifest.json CSS reference
4. Test extension loads correctly
5. Package new version

### Phase 3: Database Rename (Low Impact) 🗄️
**Time:** 1 hour
**Impact:** Low - Backend only, not visible to users
**Files:** 6 files

1. Create backup of looplocal.db
2. Rename to parasosh.db
3. Update all backend scripts
4. Test server starts correctly
5. Deploy with zero downtime

### Phase 4: File Structure (Lowest Impact) 📁
**Time:** 15 minutes
**Impact:** Very Low - Development only

1. Rename main folder (after exiting directory)
2. Clean up old zip files
3. Update any absolute paths (unlikely)

---

## BREAKING CHANGES WARNING ⚠️

### localStorage Key Changes
If you change `looplocal_session` → `parasosh_session`:
- **Impact:** All logged-in users will be logged out
- **Solution:** Add migration code in auth.js:
```javascript
// Migrate old localStorage keys
if (localStorage.getItem('looplocal_session')) {
  localStorage.setItem('parasosh_session', localStorage.getItem('looplocal_session'));
  localStorage.removeItem('looplocal_session');
}
```

### Database Rename
If you rename `looplocal.db` → `parasosh.db`:
- **Impact:** Server won't find database on restart
- **Solution:** Deploy with file rename + code update simultaneously

### CSS File Rename
If you rename `looplocal-styles.css`:
- **Impact:** Extension won't load styles correctly
- **Solution:** Update manifest.json in same commit

---

## CURRENT STATUS BY FILE

### ✅ Fully Rebranded (No Action Needed)
- `background.js` - All ParaSosh
- `content-scripts/instagram.js` - All ParaSosh
- `content-scripts/tiktok.js` - All ParaSosh
- `ext-auth.js` - All ParaSosh
- `ps-backend/main.py` (API & HTML generation) - All ParaSosh

### ⚠️ Partially Rebranded (Needs Minor Updates)
- `manifest.json` - Just CSS filename
- `popup.html` - Just title tag
- `popup.js` - Just internal CSS classes (optional)

### ❌ Not Rebranded (Needs Full Update)
- `ps-webapp/index.html`
- `ps-webapp/dashboard.html`
- `ps-webapp/login.html`
- `ps-webapp/signup.html`
- `ps-webapp/share.html`
- `ps-webapp/auth.js`
- `ps-webapp/dashboard.js`
- `ps-webapp/share.js`
- `ps-webapp/service-worker.js`
- `ps-webapp/manifest.json`
- All backend database references

---

## TESTING CHECKLIST (Post-Rebrand)

### Extension
- [ ] Extension loads without errors
- [ ] CSS styles apply correctly
- [ ] Save button appears on Instagram
- [ ] Save button appears on TikTok
- [ ] Popup opens and displays correctly
- [ ] Title shows "ParaSosh" in browser

### Web App
- [ ] All page titles show "ParaSosh"
- [ ] Login works (check localStorage keys)
- [ ] Dashboard loads user saves
- [ ] Share links work
- [ ] No console errors

### Backend
- [ ] Server starts successfully
- [ ] Database loads correctly
- [ ] Backups are created with new names
- [ ] API endpoints respond correctly

---

## RECOMMENDATION

### Priority Order:
1. **Phase 1: Web App** (ps-webapp/) - Highest user impact
2. **Phase 2: Extension Polish** (popup.html, CSS file) - Medium impact
3. **Phase 3: Database Files** (Backend .db files) - Low impact
4. **Phase 4: File Structure** (Folder names) - Lowest impact

### Why This Order?
- Web app has most "LoopLocal" references still visible to users
- Extension is mostly done, just minor polish needed
- Database names don't affect user experience
- File structure is development-only

---

**Generated:** 2026-01-10
**Audit Version:** 1.0
**Status:** 🟡 Partial Rebrand Complete

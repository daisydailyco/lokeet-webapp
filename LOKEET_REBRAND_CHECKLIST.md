# Lokeet Rebrand Checklist

## Overview
Complete rebrand from LoopLocal → ParaSosh → **Lokeet**

**Total instances found:** 197+
**Files affected:** 50+

---

## 🔴 CRITICAL (User-Facing)

### Extension Files
- [ ] `manifest.json` (5 changes)
  - [ ] "name": "ParaSosh: Save & Share" → "Lokeet: Save & Share"
  - [ ] "default_title": "ParaSosh" → "Lokeet"
  - [ ] host_permissions: "*://parasosh.io/*" → "*://lokeet.io/*"
  - [ ] CSS references: "parasosh-styles.css" → "lokeet-styles.css"

- [ ] `popup.html` (14 changes)
  - [ ] Title: "ParaSosh" → "Lokeet"
  - [ ] Logo div text
  - [ ] All `.looplocal-*` classes → `.lokeet-*`
  - [ ] parasosh.io links → lokeet.io

- [ ] `popup.js` (20 changes)
  - [ ] Class: `ParaSoshPopup` → `LokeetPopup`
  - [ ] All `.looplocal-*` CSS classes → `.lokeet-*`

- [ ] `background.js` (3 changes)
  - [ ] Class: `ParaSoshAPI` → `LokeetAPI`
  - [ ] Notification: "Saved to ParaSosh!" → "Saved to Lokeet!"

- [ ] `ext-auth.js` (12 changes)
  - [ ] Storage keys: `looplocal_session` → `lokeet_session`
  - [ ] Storage keys: `looplocal_user` → `lokeet_user`
  - [ ] Comments

### Content Scripts
- [ ] `content-scripts/instagram.js` (36 changes)
  - [ ] Class: `InstagramParaSosh` → `InstagramLokeet`
  - [ ] All `.looplocal-*` classes → `.lokeet-*`
  - [ ] Button: "Save to ParaSosh" → "Save to Lokeet"
  - [ ] Console logs: "[ParaSosh]" → "[Lokeet]"

- [ ] `content-scripts/tiktok.js` (33 changes)
  - [ ] Class: `TikTokParaSosh` → `TikTokLokeet`
  - [ ] All `.looplocal-*` classes → `.lokeet-*`
  - [ ] Console logs: "[ParaSosh]" → "[Lokeet]"

### Styles
- [ ] Rename: `parasosh-styles.css` → `lokeet-styles.css`
- [ ] Inside file: All `.looplocal-*` → `.lokeet-*` (~10 classes)

---

## 🟡 BACKEND/API

### Python Backend
- [ ] `ps-backend/main.py` (11 changes)
  - [ ] App title: "ParaSosh AI Backend" → "Lokeet AI Backend"
  - [ ] BASE_URL: "https://parasosh.io" → "https://lokeet.io"
  - [ ] Database: `parasosh.db` → `lokeet.db`

- [ ] `ps-backend/init_db.py` (1 change)
  - [ ] Database references

- [ ] `ps-backend/migrate.py` (2 changes)
  - [ ] Database file paths

- [ ] `ps-backend/backup.py` (5 changes)
  - [ ] Database patterns: `parasosh_backup_*.db` → `lokeet_backup_*.db`

- [ ] `ps-backend/test_api.py` (3 changes)
  - [ ] Test references

- [ ] `ps-backend/README.md` (8 changes)
  - [ ] Title and descriptions

### Rename Backend Directory
- [ ] `ps-backend/` → `lokeet-backend/` (optional but recommended)

---

## 🟢 WEB APPS

### Main Webapp (ps-webapp)
- [ ] `ps-webapp/manifest.json` (2 changes)
  - [ ] "name": "ParaSosh" → "Lokeet"
  - [ ] "short_name": "ParaSosh" → "Lokeet"

- [ ] `ps-webapp/index.html` (5 changes)
  - [ ] Title, logo, taglines
  - [ ] URL: looplocals.com → lokeet.io

- [ ] `ps-webapp/login.html` (4 changes)
- [ ] `ps-webapp/signup.html` (similar changes)
- [ ] `ps-webapp/share.html` (similar changes)

- [ ] `ps-webapp/service-worker.js` (2 changes)
  - [ ] Cache name: `looplocal-v7` → `lokeet-v1`

- [ ] `ps-webapp/auth.js` (3 changes)
  - [ ] Storage keys: `looplocal_*` → `lokeet_*`

### Next.js Webapp
- [ ] `ps-webapp-next/package.json` (1 change)
  - [ ] Package name: "looplocal-webapp-next" → "lokeet-webapp-next"

- [ ] `ps-webapp-next/public/service-worker.js` (cache names)

### Rename Webapp Directories
- [ ] `ps-webapp/` → `lokeet-webapp/` (optional)
- [ ] `ps-webapp-next/` → `lokeet-webapp-next/` (optional)

---

## 🔵 DOCUMENTATION

- [ ] Update all `.md` files with new branding
  - [ ] README.md files
  - [ ] MIGRATION_GUIDE.md
  - [ ] DATABASE_SETUP_COMPLETE.md
  - [ ] REBRAND_*.md files
  - [ ] Other documentation

---

## 📋 REPLACEMENT PATTERNS

### Text Replacements
```
ParaSosh     → Lokeet
parasosh     → lokeet
LoopLocal    → Lokeet
looplocal    → lokeet
```

### CSS Classes
```
.looplocal-* → .lokeet-*
```

### Storage Keys
```
looplocal_session → lokeet_session
looplocal_user    → lokeet_user
```

### JavaScript Classes
```
ParaSoshPopup      → LokeetPopup
ParaSoshAPI        → LokeetAPI
InstagramParaSosh  → InstagramLokeet
TikTokParaSosh     → TikTokLokeet
```

### Domains/URLs
```
parasosh.io    → lokeet.io
looplocals.com → lokeet.io
```

### File Names
```
parasosh-styles.css → lokeet-styles.css
parasosh.db         → lokeet.db
parasosh_backup_*   → lokeet_backup_*
```

---

## 🤖 Automated Rebrand Script

Would you like me to create a script to automate most of these changes?

Suggested approach:
1. **Phase 1**: Rename files and directories
2. **Phase 2**: Find and replace text in files
3. **Phase 3**: Update CSS classes
4. **Phase 4**: Test and verify
5. **Phase 5**: Update deployment configs

---

## ⚠️ MIGRATION NOTES

### Storage Key Migration
When changing `looplocal_*` to `lokeet_*`, users' sessions will be invalidated.

**Solution**: Add migration code in ext-auth.js:
```javascript
// Check for old keys and migrate
const oldSession = localStorage.getItem('looplocal_session');
if (oldSession && !localStorage.getItem('lokeet_session')) {
  localStorage.setItem('lokeet_session', oldSession);
  localStorage.removeItem('looplocal_session');
}
```

### CSS Class Migration
CSS classes are internal only, so no migration needed.

### Database Migration
If keeping the same Railway instance, database tables don't need renaming. Just update references in code.

---

## 🎯 Priority Order

1. **Extension** (highest impact) - User sees this immediately
2. **Backend API** - Domain and branding
3. **Web Apps** - If publicly accessible
4. **Documentation** - For developers/support

---

**Ready to proceed?** I can start the automated rebrand now, or you can review this checklist first.
